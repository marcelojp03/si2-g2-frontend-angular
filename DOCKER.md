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
docker run --rm --name si2-g2-frontend -p 4200:80 si2-g2-frontend
```

La aplicacion quedara disponible en:

```text
http://localhost:4200
```

Si usas la imagen local, asegurate de que el backend este expuesto en `http://localhost:2026`.

## Desarrollo con recarga en caliente (Docker Compose)

Desde la raiz del proyecto, con el perfil `dev` (puerto **4300**):

```bash
docker compose --profile dev up -d backend frontend-dev
```

Abre `http://localhost:4300`. El codigo se monta como volumen y `ng serve` usa `poll` para detectar cambios en Windows + Docker.

El contenedor `frontend` en el puerto **4200** es Nginx con build estatico: ahi **no** hay recarga en vivo.

## Ver logs

Si ejecutaste el contenedor con `docker run`:

```bash
docker logs -f si2-g2-frontend
```

Si levantaste el proyecto desde la raiz con Docker Compose:

```bash
docker compose logs -f frontend
```
