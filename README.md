# Gestoría Fiscal - MZChat

Una aplicación web para gestión fiscal con chat inteligente, construida con Next.js, TypeScript, y PostgreSQL.

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

## Configuración del Proyecto

### 1. Instalación

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd mzchat

# Instalar dependencias
npm install
```

### 2. Configuración de la Base de Datos

Crea una base de datos PostgreSQL. Recomendamos usar:
- [Neon](https://neon.tech) (gratuito)
- [Railway](https://railway.app) (gratuito)
- [Supabase](https://supabase.com) (gratuito)

### 3. Variables de Entorno

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
```

### 4. Configuración de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente 
3. Habilita la API de Google OAuth2
4. Crea credenciales OAuth 2.0:
   - Tipo: Aplicación web
   - URI de redirección autorizada: `http://localhost:3000/api/auth/callback/google`
   - Para producción: `https://tu-dominio.com/api/auth/callback/google`
5. Copia el Client ID y Client Secret a tu archivo `.env.local`

### 5. Configuración de la Base de Datos

```bash
# Ejecutar migraciones
npx prisma db push

# (Opcional) Generar el cliente Prisma
npx prisma generate
```

### 6. Crear un Usuario Revisor

Para crear un usuario con rol de revisor, primero inicia sesión normalmente, luego ejecuta en la base de datos:

```sql
UPDATE "User" SET role = 'revisor' WHERE email = 'tu-email@ejemplo.com';
```

### 7. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth endpoints
│   │   ├── chats/         # API de chats de usuarios
│   │   └── admin/         # API de administración
│   ├── usuario/           # Página de usuarios
│   ├── revisor/           # Página de revisores
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de inicio
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades y configuraciones
│   ├── auth.ts           # Configuración de NextAuth
│   └── prisma.ts         # Cliente de Prisma
└── types/                # Definiciones de tipos TypeScript
```

## Funcionalidades

### Para Usuarios Normales (`/usuario`)
- ✅ Chat para realizar consultas fiscales
- ✅ Historial de consultas con estados
- ✅ Acceso a recursos y documentos
- ✅ FAQs y calculadoras

### Para Revisores (`/revisor`)
- ✅ Panel de administración
- ✅ Lista de todas las consultas
- ✅ Cambiar estado de consultas (validado/revisión requerida)
- ✅ Agregar comentarios a las consultas
- ✅ Estadísticas de consultas

## Despliegue en Vercel

### 1. Preparación

1. Sube tu código a GitHub
2. Configura tu base de datos PostgreSQL en producción

### 2. Desplegar en Vercel

1. Ve a [Vercel](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno en Vercel:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (tu dominio de producción)
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### 3. Configuración Post-Despliegue

1. Actualiza las URIs de redirección en Google OAuth para incluir tu dominio de producción
2. Ejecuta las migraciones de base de datos:
   ```bash
   npx prisma db push
   ```

## Base de Datos

### Modelos Principales

- **User**: Usuarios del sistema con roles
- **Chat**: Consultas de los usuarios
- **Account/Session**: Tablas de NextAuth para autenticación

### Estados de Chat

- `pendiente`: Nueva consulta sin revisar
- `validado`: Consulta aprobada por un revisor
- `revision_requerida`: Consulta que necesita más atención

## Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Servidor de producción
npm run lint         # Linter de código
```

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
