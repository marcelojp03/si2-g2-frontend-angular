# Docker - Frontend Angular

Este proyecto se construye como una aplicacion Angular estatica y se sirve con Nginx.

## Construir imagen

```bash
docker build -t si2-g2-frontend .
```

Por defecto se usa la configuracion `production` de Angular.
El Dockerfile instala dependencias con `npm ci --legacy-peer-deps` porque el proyecto mezcla paquetes Angular 20 y 21.

Para compilar apuntando al backend local configurado en `src/environments/environment.ts`:

```bash
docker build --build-arg BUILD_CONFIGURATION=development -t si2-g2-frontend:local .
```

## Ejecutar contenedor

```bash
docker run --rm -p 4200:80 si2-g2-frontend
```

La aplicacion quedara disponible en:

```text
http://localhost:4200
```

Si usas la imagen local, asegurate de que el backend este expuesto en `http://localhost:2026`.
