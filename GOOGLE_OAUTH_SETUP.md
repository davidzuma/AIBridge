# Guía de Configuración de Google OAuth

## 🔧 El problema actual

El login con Google está fallando con `error=google`, lo que indica que hay un problema con la configuración de OAuth en Google Cloud Console.

## ✅ Solución paso a paso

### 1. Ir a Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto o crea uno nuevo

### 2. Habilitar Google+ API
1. Ve a "APIs & Services" > "Library"
2. Busca "Google+ API" y habilitala
3. También habilita "Google People API"

### 3. Crear credenciales OAuth 2.0
1. Ve a "APIs & Services" > "Credentials"
2. Click en "Create Credentials" > "OAuth 2.0 Client IDs"
3. Selecciona "Web application"

### 4. Configurar URLs autorizadas
**CRÍTICO**: Debes agregar estas URLs exactas:

#### JavaScript origins:
```
http://localhost:3000
```

#### Authorized redirect URIs:
```
http://localhost:3000/api/auth/callback/google
```

### 5. Verificar credenciales actuales
Las credenciales en tu `.env.local` son:
- GOOGLE_CLIENT_ID: `551411570887-iqukrvoosa4k79nenavdl258ot5n7su6.apps.googleusercontent.com`
- GOOGLE_CLIENT_SECRET: `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`

**⚠️ IMPORTANTE**: Estas credenciales deben tener configurada la URL `http://localhost:3000/api/auth/callback/google` en Google Cloud Console.

### 6. Verificar la configuración
Después de configurar las URLs:
1. Guarda los cambios en Google Cloud Console
2. Espera unos minutos para que se propaguen los cambios
3. Prueba el login nuevamente

## 🔍 Cómo verificar si está funcionando

1. Ve a `http://localhost:3000/test-login`
2. Click en "Iniciar sesión con Google"
3. Deberías ser redirigido a Google para autenticarte
4. Después de autenticarte, deberías regresar a la aplicación con una sesión activa

## 🚨 Errores comunes

1. **"Error 400: redirect_uri_mismatch"**: Las URLs no están configuradas correctamente en Google Cloud Console
2. **"Error: google"**: Problema general de configuración OAuth
3. **Infinite redirect loop**: NEXTAUTH_URL no coincide con la URL real

## 🔧 Troubleshooting adicional

Si el problema persiste:

1. **Verificar variables de entorno**:
   ```bash
   curl http://localhost:3000/api/debug/env
   ```

2. **Ver logs detallados**:
   Los logs de NextAuth aparecen en la consola del servidor de desarrollo

3. **Usar credenciales de prueba temporales**:
   Crear nuevas credenciales OAuth en Google Cloud Console específicamente para desarrollo local

## 📞 Pasos inmediatos

1. Ve a Google Cloud Console
2. Encuentra las credenciales OAuth con el Client ID: `551411570887-iqukrvoosa4k79nenavdl258ot5n7su6`
3. Edita las credenciales
4. Agrega `http://localhost:3000/api/auth/callback/google` a "Authorized redirect URIs"
5. Guarda los cambios
6. Prueba el login nuevamente
