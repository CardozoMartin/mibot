const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');

// Datos estáticos del perfil
const perfil = {
    nombre: "Martin Cardozo", // Reemplaza con tu nombre real
    descripcion: "¡Hola! Soy un desarrollador full stack y estudiante avanzado en la Tecnicatura de Programación. " +
                 "Apasionado por crear soluciones tecnológicas innovadoras, domino un amplio stack de tecnologías y estoy listo para llevar tus ideas al siguiente nivel.",
    tecnologias: [
        "JavaScript", "TypeScript", "Node.js", "MongoDB", "MySQL",
        "Java", "Spring Boot", "NestJS", "React", "HTML", "CSS"
    ],
    portafolio: "https://miportafolio20.netlify.app/" // Reemplaza con el enlace real a tu portafolio
};

const proyectos = [
    {
        id: 1,
        nombre: "E-commerce",
        descripcion: "Tiendas online completas con catálogo de productos, carrito de compras, pasarela de pagos y panel de administración.",
        tecnologias: ["React", "Node.js", "MongoDB/MySQL", "CSS"],
        detalles: "Incluye: diseño responsive, integración con APIs de pago (Mercado Pago, Stripe), gestión de inventario y autenticación de usuarios."
    },
    {
        id: 2,
        nombre: "Landing Page",
        descripcion: "Páginas web atractivas y optimizadas para captar leads o promocionar productos/servicios.",
        tecnologias: ["React", "HTML", "CSS", "JavaScript"],
        detalles: "Incluye: diseño moderno, SEO básico, formularios de contacto y animaciones fluidas."
    },
    {
        id: 3,
        nombre: "Bot de WhatsApp Estático",
        descripcion: "Bots informativos para WhatsApp que presentan servicios, productos o información de manera interactiva.",
        tecnologias: ["Node.js", "@bot-whatsapp/bot"],
        detalles: "Incluye: menús dinámicos, respuestas automáticas y navegación fluida. Ideal para negocios pequeños."
    },
    {
        id: 4,
        nombre: "Bot de WhatsApp con CRM",
        descripcion: "Bots avanzados integrados con un CRM para gestionar clientes, generar ventas y procesar pedidos.",
        tecnologias: ["Node.js", "TypeScript", "NestJS", "MongoDB/MySQL"],
        detalles: "Incluye: conexión con frontend y backend, base de datos para pedidos, y panel de control para el negocio."
    },
    {
        id: 5,
        nombre: "Sistema Completo (Frontend + Backend + DB)",
        descripcion: "Aplicaciones web completas con frontend, backend y base de datos, adaptadas a las necesidades del cliente.",
        tecnologias: ["React", "Node.js/NestJS", "MongoDB/MySQL", "Java/Spring Boot"],
        detalles: "Incluye: autenticación, APIs REST, diseño responsive y escalabilidad para futuros módulos."
    }
];

// Flujo para "Sobre Mí"
const flowSobreMi = addKeyword(EVENTS.ACTION)
    .addAnswer(
        `🌟 *Sobre Mí* 🌟\n` +
        `${perfil.descripcion}\n` +
        `📚 *Estudios*: Estudiante avanzado en Tecnicatura de Programación.\n` +
        `🚀 *Habilidades*: ${perfil.tecnologias.join(', ')}.\n` +
        `🌐 *Portafolio*: ${perfil.portafolio}`
    )
    .addAnswer(
        "👉 ¿Qué quieres hacer ahora?\n" +
        "1. Volver al menú principal\n" +
        "2. Finalizar",
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow }) => {
            const opcion = ctx.body;
            if (opcion === "1") {
                return gotoFlow(flowMenuPrincipal);
            } else if (opcion === "2") {
                await flowDynamic("¡Gracias por conocerme! Escribe 'hola dev' cuando quieras volver. 😊");
                return;
            } else {
                await flowDynamic("Por favor, selecciona 1 o 2.");
                return gotoFlow(flowSobreMi);
            }
        }
    );

// Flujo para "Proyectos"
const flowProyectos = addKeyword(EVENTS.ACTION)
    .addAnswer(
        "💻 *Proyectos que Puedo Ofrecer* 💻\n" +
        proyectos.map(p => `${p.id}. ${p.nombre}`).join('\n') +
        "\n\nEscribe el número del proyecto para más detalles."
    )
    .addAnswer(
        "🛠️ Selecciona un proyecto (número):",
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow, state }) => {
            const opcion = parseInt(ctx.body);
            const proyecto = proyectos.find(p => p.id === opcion);
            if (!proyecto) {
                await flowDynamic("⚠️ Opción no válida. Por favor, selecciona un número válido.");
                return gotoFlow(flowProyectos);
            }

            // Guardar proyecto seleccionado
            await state.update({ proyecto });

            // Mostrar detalles del proyecto
            await flowDynamic(
                `🌟 *${proyecto.nombre}*\n` +
                `${proyecto.descripcion}\n` +
                `🛠️ *Tecnologías*: ${proyecto.tecnologias.join(', ')}\n` +
                `ℹ️ *Detalles*: ${proyecto.detalles}`
            );

            // Opciones después de seleccionar proyecto
            await flowDynamic(
                "👉 ¿Qué quieres hacer?\n" +
                "1. Volver a proyectos\n" +
                "2. Volver al menú principal\n" +
                "3. Finalizar"
            );
            return gotoFlow(flowOpcionesProyecto);
        }
    );

// Flujo para opciones después de seleccionar un proyecto
const flowOpcionesProyecto = addKeyword(EVENTS.ACTION)
    .addAnswer(
        "Selecciona una opción (número):",
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow }) => {
            const opcion = ctx.body;
            switch (opcion) {
                case "1":
                    return gotoFlow(flowProyectos);
                case "2":
                    return gotoFlow(flowMenuPrincipal);
                case "3":
                    await flowDynamic("¡Gracias por conocerme! Escribe 'hola dev' cuando quieras volver. 😊");
                    return;
                default:
                    await flowDynamic("⚠️ Por favor, selecciona 1, 2 o 3.");
                    return gotoFlow(flowOpcionesProyecto);
            }
        }
    );

// Flujo para "Contacto"
const flowContacto = addKeyword(EVENTS.ACTION)
    .addAnswer(
        "📞 *Contáctame* 📞\n" +
        "Estoy listo para colaborar en tu próximo proyecto:\n" +
        "- 📧 Email: martincardozo1993xp@gmail.com\n" +
        "- 🌐 Portafolio: " + perfil.portafolio + "\n" +
        "- 📱 WhatsApp: +3812032666\n" +
        "¡Hablemos y hagamos realidad tus ideas!"
    )
    .addAnswer(
        "👉 ¿Qué quieres hacer ahora?\n" +
        "1. Volver al menú principal\n" +
        "2. Finalizar",
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow }) => {
            const opcion = ctx.body;
            if (opcion === "1") {
                return gotoFlow(flowMenuPrincipal);
            } else if (opcion === "2") {
                await flowDynamic("¡Gracias por conocerme! Escribe 'hola dev' cuando quieras volver. 😊");
                return;
            } else {
                await flowDynamic("Por favor, selecciona 1 o 2.");
                return gotoFlow(flowContacto);
            }
        }
    );

// Flujo del menú principal
const flowMenuPrincipal = addKeyword(EVENTS.ACTION)
    .addAnswer(
        "🌟 *Hola, soy " + perfil.nombre + " - Desarrollador Full Stack* 🌟\n" +
        "¡Bienvenido a mi perfil! Estoy aquí para ayudarte con soluciones tecnológicas. ¿Qué quieres saber?\n\n" +
        "1. ℹ️ Sobre mí\n" +
        "2. 💻 Proyectos que ofrezco\n" +
        "3. 📞 Contacto\n" +
        "4. 👋 Finalizar\n\n" +
        "Escribe el número de la opción:"
    )
    .addAnswer(
        "Selecciona una opción:",
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow }) => {
            const opcion = ctx.body;
            switch (opcion) {
                case "1":
                    return gotoFlow(flowSobreMi);
                case "2":
                    return gotoFlow(flowProyectos);
                case "3":
                    return gotoFlow(flowContacto);
                case "4":
                    await flowDynamic("¡Gracias por conocerme! Escribe 'hola dev' cuando quieras volver. 😊");
                    return;
                default:
                    await flowDynamic("⚠️ Opción no válida. Por favor, selecciona 1, 2, 3 o 4.");
                    return gotoFlow(flowMenuPrincipal);
            }
        }
    );

// Flujo principal
const flowPrincipal = addKeyword(['hola dev'], { sensitive: true })
    .addAnswer(`¡Hola! Soy ${perfil.nombre}, desarrollador full stack. 🚀`)
    .addAnswer(
        "Estoy listo para presentarte mi perfil y lo que puedo ofrecerte. ¡Empecemos!",
        null,
        async (ctx, { gotoFlow }) => {
            return gotoFlow(flowMenuPrincipal);
        }
    );

const main = async () => {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([
        flowPrincipal,
        flowMenuPrincipal,
        flowSobreMi,
        flowProyectos,
        flowOpcionesProyecto,
        flowContacto
    ]);
    const adapterProvider = createProvider(BaileysProvider);

    const bot = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    QRPortalWeb();

    adapterProvider.on('ready', () => {
        console.log('WhatsApp Provider está listo');
    });

    adapterProvider.on('error', (err) => {
        console.error('Error en el provider:', err);
    });
};

main().catch(err => console.error('Error en main:', err));