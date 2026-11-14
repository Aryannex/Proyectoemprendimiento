const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// maximo de 30 mensajes cada 15 minutos por persona pa que no se pete
const limitarChat = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: { success: false, error: 'Demasiados mensajes. Intenta de nuevo en unos minutos.' }
});

// Lo que el bot sabe del negocio
const BASE = `Eres el asistente virtual de "Momentos Eternos", un emprendimiento que convierte fotos con significado en lienzos pintados a mano y enmarcados. Hablas en español, con tono cálido y cercano, y tus respuestas son cortas (máximo 4 o 5 frases).

Información del negocio:
- Tamaños y precios (COP): Mini 20x30 cm $35.000; Pequeño 30x40 cm $50.000; Mediano 50x70 cm $130.000; Grande 70x100 cm $180.000.
- Envío nacional: $20.000.
- El cliente sube su foto en el formulario de la página y puede agregar una descripción con detalles (colores de fondo, estilo, texto).
- Contacto: WhatsApp +57 300 123 4567, correo info@momentoseternos.com, Instagram @momentoseternos.

Reglas:
- Solo hablas de los lienzos, tamaños, precios y del proceso del pedido. Si te preguntan otra cosa, di amablemente que solo puedes ayudar con eso.
- No inventes datos. Si no sabes algo (tiempos de entrega, formas de pago, envíos fuera del país), dilo y sugiere escribir por WhatsApp.
- No pidas datos personales (nombre, teléfono, dirección ni correo).`;

const MODOS = {
  recomendador: `${BASE}

Tu tarea ahora: recomendar un tamaño. Pregunta una sola cosa a la vez: para qué es el cuadro (regalo, decoración, recuerdo) y dónde lo pondrá o cuánto espacio tiene. Cuando tengas suficiente información, recomienda UN tamaño, explica el motivo en una frase y menciona el precio del lienzo más el envío.`,

  creativo: `${BASE}

Tu tarea ahora: ayudar al cliente a escribir la descripción de su pintura con ideas de colores de fondo, estilo, ambiente, o una dedicatoria o texto corto. Cuando tengas una propuesta, entrégala lista para pegar en el formulario, de máximo 300 caracteres, en una línea aparte que empiece exactamente con "DESCRIPCIÓN:".`
};

router.post('/', limitarChat, async (req, res) => {
  try {
    const { modo, mensajes } = req.body;

    // Validaciones
    if (!Object.hasOwn(MODOS, modo)) {
      return res.status(400).json({ success: false, error: 'Modo no válido.' });
    }
    if (!Array.isArray(mensajes) || mensajes.length === 0 || mensajes.length > 12) {
      return res.status(400).json({ success: false, error: 'Mensajes no válidos.' });
    }
    for (const m of mensajes) {
      const rolValido = m && (m.rol === 'user' || m.rol === 'assistant');
      if (!rolValido || typeof m.texto !== 'string' || m.texto.length === 0 || m.texto.length > 500) {
        return res.status(400).json({ success: false, error: 'Mensajes no válidos.' });
      }
    }
    if (mensajes[0].rol !== 'user' || mensajes[mensajes.length - 1].rol !== 'user') {
      return res.status(400).json({ success: false, error: 'Mensajes no válidos.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, error: 'El chat no está configurado.' });
    }

     
       const modelos = [
      process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      process.env.GEMINI_MODEL_RESPALDO
    ]
      .map(m => (m || '').trim().replace(/^models\//, ''))
      .filter(Boolean);
      
    const cuerpo = JSON.stringify({
      systemInstruction: { parts: [{ text: MODOS[modo] }] },
      contents: mensajes.map(m => ({
        role: m.rol === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.texto }]
      })),
      generationConfig: { temperature: 0.7, maxOutputTokens: 1200 }
    });

    function llamarGemini(nombreModelo) {
      return fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${nombreModelo}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.GEMINI_API_KEY
          },
          body: cuerpo,
          signal: AbortSignal.timeout(15000)
        }
      );
    }

    // Hasta 2 intentos por modelo si Google está saturado (429, 500 o 503)
    let respuesta;
    for (const nombreModelo of modelos) {
      for (let intento = 0; intento < 2; intento++) {
        respuesta = await llamarGemini(nombreModelo);
        if (respuesta.ok || ![429, 500, 503].includes(respuesta.status)) break;
        await new Promise(r => setTimeout(r, 1500));
      }
      if (respuesta.ok) break;
    }

    if (!respuesta.ok) {
      console.error('Error de Gemini:', respuesta.status, await respuesta.text());
      const aviso = [429, 503].includes(respuesta.status)
        ? 'El asistente está muy ocupado. Intenta de nuevo en un minuto.'
        : 'El asistente no está disponible en este momento.';
      return res.status(502).json({ success: false, error: aviso });
    }

    const data = await respuesta.json();
    const texto = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('').trim();

    if (!texto) {
      console.error('Respuesta vacía de Gemini:', JSON.stringify(data).slice(0, 600));
      return res.status(502).json({ success: false, error: 'No pude generar una respuesta. Intenta de nuevo.' });
    }

    res.json({ success: true, respuesta: texto });
    } catch (e) {
    console.error('Error en /api/chat:', e.name, e.message);
    if (e.name === 'TimeoutError' || e.name === 'AbortError') {
      return res.status(504).json({ success: false, error: 'El asistente tardó demasiado. Intenta de nuevo.' });
    }
    res.status(500).json({ success: false, error: 'Error del servidor.' });
  }
});

module.exports = router;