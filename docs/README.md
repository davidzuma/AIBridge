# 📚 MZChat - Documentación

Bienvenido a la documentación completa del proyecto MZChat, una aplicación web para gestión fiscal con chat inteligente.

## 📋 Índice de Documentación

### 🚀 Inicio Rápido
- **[README Principal](../README.md)** - Introducción y configuración básica del proyecto

### 📊 Estado del Proyecto
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Estado actual del proyecto, funcionalidades completadas y testing

### 🛠️ Configuración y Setup
- **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Guía completa de configuración del entorno de desarrollo
- **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** - Configuración detallada de Google OAuth para autenticación

### 🚀 Despliegue
- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Guía completa para desplegar en Vercel

### 🧹 Mantenimiento
- **[CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md)** - Resumen de la limpieza y optimización del proyecto

## 🎯 Guía de Lectura Recomendada

### Para Nuevos Desarrolladores:
1. **[README Principal](../README.md)** - Para entender qué es el proyecto
2. **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Para conocer las funcionalidades
3. **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Para configurar el entorno
4. **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** - Para configurar la autenticación

### Para Despliegue en Producción:
1. **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Guía completa de despliegue
2. **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Para variables de entorno de producción

### Para Mantenimiento:
1. **[CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md)** - Historial de optimizaciones realizadas

## 🔧 Estructura del Proyecto

```
mzchat/
├── docs/                          # 📚 Documentación (esta carpeta)
├── src/
│   ├── app/                      # 🏠 Páginas y API routes (Next.js App Router)
│   ├── components/               # 🧩 Componentes reutilizables
│   ├── lib/                      # 🛠️ Utilidades y configuraciones
│   └── types/                    # 📝 Definiciones de tipos TypeScript
├── prisma/                       # 🗄️ Esquema de base de datos
├── public/                       # 🌐 Archivos estáticos
└── setup-*.js                    # ⚙️ Scripts de configuración
```

## 📞 Soporte

Si tienes preguntas sobre la documentación o necesitas ayuda:

1. **Revisa la documentación relevante** en esta carpeta
2. **Consulta el README principal** para configuración básica
3. **Verifica el estado del proyecto** en PROJECT_STATUS.md

## 🚀 Tecnologías Principales

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Estilos**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL + Prisma ORM
- **Autenticación**: NextAuth.js con Google OAuth
- **IA**: OpenAI GPT para respuestas fiscales
- **Despliegue**: Vercel

---

*Última actualización: Mayo 2025*
