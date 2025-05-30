# Gestoría Fiscal - MZChat

Una aplicación web para gestión fiscal con chat inteligente, construida con Next.js, TypeScript, y PostgreSQL.

## 📚 Documentación

Para información detallada sobre configuración, despliegue y desarrollo, consulta la documentación en la carpeta [`docs/`](./docs/):

- **[📋 Estado del Proyecto](./docs/PROJECT_STATUS.md)** - Estado actual y funcionalidades
- **[🛠️ Configuración del Entorno](./docs/ENVIRONMENT_SETUP.md)** - Guía de configuración completa
- **[🔐 Configuración de Google OAuth](./docs/GOOGLE_OAUTH_SETUP.md)** - Setup de autenticación
- **[🚀 Guía de Despliegue en Vercel](./docs/VERCEL_DEPLOYMENT_GUIDE.md)** - Instrucciones de despliegue
- **[🧹 Resumen de Limpieza](./docs/CLEANUP_SUMMARY.md)** - Historial de optimizaciones

## Características

- 🔐 Autenticación con Google usando NextAuth
- 📊 Base de datos PostgreSQL con Prisma ORM
- 👥 Sistema de roles (usuario/revisor)
- 💬 Chat de consultas fiscales
- 📋 Panel de administración para revisores
- 🎨 Interfaz moderna con Tailwind CSS
- 🚀 Optimizado para despliegue en Vercel

## Tecnologías

- **Framework**: Next.js 15 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: NextAuth.js
- **Despliegue**: Vercel

## ⚡ Inicio Rápido

### 1. Instalación

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd mzchat

# Instalar dependencias
npm install
```

### 2. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-nextauth-secret-aleatorio"

# Google OAuth
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# OpenAI (opcional)
OPENAI_API_KEY="tu-openai-api-key"
```

### 3. Configuración de Base de Datos

```bash
# Configurar la base de datos
npx prisma db push

# Ejecutar en desarrollo
npm run dev
```

### 4. Configuración Adicional

Para configuración detallada incluyendo Google OAuth, base de datos en producción, y despliegue, consulta la **[documentación completa](./docs/)**.

Para otorgar estado premium a un usuario:

```bash
npm run setup:premium
```

### 8. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
## 🏗️ Estructura del Proyecto

```
mzchat/
├── docs/                  # 📚 Documentación completa
├── src/
│   ├── app/              # 🏠 Páginas y API routes (Next.js App Router)
│   │   ├── api/          # 🔌 API endpoints
│   │   ├── usuario/      # 👤 Dashboard de usuarios
│   │   ├── revisor/      # 👨‍💼 Dashboard de revisores
│   │   └── pricing/      # 💰 Página de precios
│   ├── components/       # 🧩 Componentes reutilizables
│   ├── lib/             # 🛠️ Utilidades y configuraciones
│   └── types/           # 📝 Definiciones de tipos TypeScript
├── prisma/              # 🗄️ Esquema de base de datos
└── setup-*.js           # ⚙️ Scripts de configuración
```

## ✨ Funcionalidades Principales

### 👤 Para Usuarios
- 💬 Chat para consultas fiscales con IA
- 📋 Historial de consultas
- 🏆 Sistema premium con validación humana
- 📊 Dashboard personalizado

### 👨‍💼 Para Revisores
- 🛠️ Panel de administración
- ✅ Validación de respuestas de IA
- 💬 Sistema de comentarios
- 📈 Estadísticas de consultas

## 🚀 Despliegue

Para desplegar el proyecto en producción, consulta la **[Guía de Despliegue en Vercel](./docs/VERCEL_DEPLOYMENT_GUIDE.md)** en la documentación.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico, configuración o desarrollo:

- **📚 Consulta la documentación**: [`docs/`](./docs/)
- **🐛 Reporta bugs**: Abre un issue en GitHub
- **💡 Solicita features**: Abre un issue con la etiqueta "enhancement"

---

*© 2025 MZ Asesoría - Sistema de consultas Fiscales y Laborales*

## Despliegue en Vercel

### Preparación
1. Asegúrate de tener una base de datos PostgreSQL accesible desde internet (puedes usar Neon, Supabase, o Railway)
2. Obtén las credenciales de Google OAuth como se describe arriba

### Pasos para el despliegue
1. **Push tu código a GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Conecta tu repositorio en Vercel**
   - Ve a [vercel.com](https://vercel.com) e inicia sesión
   - Haz clic en "New Project"
   - Importa tu repositorio de GitHub

3. **Configura las variables de entorno en Vercel**
   En la configuración del proyecto, agrega:
   ```
   NEXTAUTH_URL=https://tu-dominio.vercel.app
   NEXTAUTH_SECRET=tu-secreto-super-seguro
   GOOGLE_CLIENT_ID=tu-google-client-id
   GOOGLE_CLIENT_SECRET=tu-google-client-secret
   DATABASE_URL=postgresql://usuario:password@host:puerto/basedatos
   ```

4. **Despliega**
   Vercel automáticamente construirá y desplegará tu aplicación

### Post-despliegue
1. Actualiza la URL autorizada en Google OAuth Console con tu dominio de Vercel
2. Ejecuta las migraciones de Prisma si es necesario:
   ```bash
   npx prisma db push
   ```

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para soporte técnico o preguntas, por favor abre un issue en GitHub.
