# IsabelLove en Vercel

La página y su API se despliegan juntas en Vercel para compartir preguntas y respuestas entre dispositivos.

## Configuración

1. Importa este repositorio en Vercel.
2. En Vercel, conecta una base Postgres compatible con `@vercel/postgres` mediante una integración como Neon.
3. Comprueba que exista la variable de entorno `POSTGRES_URL` en Production.
4. Despliega el proyecto.

La tabla `memories` se crea automáticamente en la primera petición. Cada fecha tiene una pregunta y dos respuestas independientes: Luis y Ana Isabel. La página consulta cambios cada 10 segundos y mantiene una copia local si la API no está disponible.

## Comprobación

Usa la URL de Vercel. Abre `https://tu-proyecto.vercel.app/api/memories`: debe responder con JSON, por ejemplo `{ "memories": [] }`.

Si responde `404`, el proyecto desplegado no contiene la carpeta `api`. Si responde `500`, revisa que la base Neon esté conectada al proyecto y que exista `POSTGRES_URL` en **Production**; después haz un nuevo redeploy.

En la página, el texto **Recuerdos sincronizados en tiempo real** confirma que ambos dispositivos están usando la base compartida. El texto **Sin conexión con la base compartida** significa que el recuerdo solo está guardándose en el navegador actual.
