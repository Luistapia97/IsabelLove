# IsabelLove en Vercel

La página usa `api/memories.js` para compartir preguntas y respuestas entre dispositivos. Netlify puede servir el HTML, pero no ejecuta esta API ni comparte los recuerdos.

## Configuración

1. Importa este repositorio en Vercel.
2. En Vercel, crea una integración de **Vercel Postgres** o conecta una base compatible con `@vercel/postgres`.
3. Comprueba que exista la variable de entorno `POSTGRES_URL` en Production.
4. Despliega el proyecto.

La tabla `memories` se crea automáticamente en la primera petición. Cada fecha tiene una pregunta y dos respuestas independientes: Luis y Ana Isabel. La página consulta cambios cada 10 segundos y mantiene una copia local si la API no está disponible.
