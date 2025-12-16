#######################################################
# README del Proyecto: Aplicación Node.js con Monitoreo
#######################################################

Este proyecto implementa una aplicación simple de Node.js, la empaqueta como una imagen Docker y utiliza Terraform para desplegarla localmente junto con una infraestructura de monitoreo que incluye Prometheus y Grafana. Todo el proceso se gestiona mediante un pipeline CI/CD en GitHub Actions.

-------------------------------------------------------
1. ARQUITECTURA Y COMPONENTES CLAVE
-------------------------------------------------------

El proyecto utiliza Docker Compose (implícitamente a través del proveedor Docker de Terraform) para orquestar tres servicios principales:

* **Aplicación (proyecto1-app)**: Aplicación simple de Node.js.
* **Servidor de Métricas (prometheus)**: Recolecta métricas de la aplicación.
* **Visualización (grafana)**: Proporciona dashboards para las métricas.

[cite_start]Todos los contenedores están conectados a una red Docker de usuario definida por Terraform (`monitoring-net`)[cite: 6, 4]. [cite_start]Esto activa el DNS interno de Docker[cite: 5], permitiendo que los contenedores se comuniquen usando sus nombres de servicio (ej: Prometheus accede a la aplicación mediante 'proyecto1-app:8080').

-------------------------------------------------------
2. TECNOLOGÍA UTILIZADA
-------------------------------------------------------

* **Aplicación**: Node.js 18
* **Contenedores**: Docker (con imagen base 'node:18-alpine')
* [cite_start]**Infraestructura como Código (IaC)**: Terraform (proveedor 'kreuzwerker/docker' [cite: 10])
* [cite_start]**Monitoreo**: Prometheus ('prom/prometheus:latest' [cite: 7][cite_start]) y Grafana ('grafana/grafana:latest' [cite: 8])
* **CI/CD**: GitHub Actions

-------------------------------------------------------
3. ESTRUCTURA DEL PROYECTO
-------------------------------------------------------

| Archivo/Directorio | Descripción |
| :--- | :--- |
| app_source/ | Contiene el código fuente y el Dockerfile de la aplicación Node.js. |
| app_source/Dockerfile.txt | Define la imagen Docker multi-etapa para la aplicación (con una etapa 'builder' y una etapa final ligera y segura con usuario no-root 'appuser'). |
| infra/ | Contiene los archivos de configuración de Terraform. |
| infra/versions.tf | [cite_start]Define la configuración del proveedor Docker (versión '~> 3.6' [cite: 10]). |
| infra/main.tf | [cite_start]Define la red Docker ('monitoring-net' [cite: 6][cite_start]), la aplicación, Prometheus [cite: 7] [cite_start]y Grafana[cite: 8], incluyendo la configuración de puertos y la conexión a la red. |
| infra/prometheus.yml | Configuración para Prometheus, con un 'job' para raspar métricas de la aplicación en 'proyecto1-app:8080'. |
| .github/workflows/main.yml | Pipeline de CI/CD que gestiona el build y el despliegue local. |

-------------------------------------------------------
4. PROCESO DE DESPLIEGUE (CI/CD)
-------------------------------------------------------

El pipeline (`.github/workflows/main.yml`) consta de dos jobs principales:

### 4.1 security_and_build

1.  **Análisis de Código/Seguridad**: Ejecuta ESLint y Snyk (dependiente de SNYK_TOKEN).
2.  **Tests**: Ejecuta los tests de unidad/integración (`npm test`).
3.  [cite_start]**Construcción Docker**: Construye la imagen Docker de la aplicación (`proyecto1-app:latest`)[cite: 7].
4.  **Artefactos**: Sube el SBOM y la carpeta de infraestructura (`infra/`) para el siguiente job.

### 4.2 deploy_local

Este job depende del éxito de 'security_and_build' y se ejecuta en un runner específico.

1.  **Re-construcción Docker**: Vuelve a construir la imagen en el runner de despliegue.
2.  [cite_start]**Terraform Init**: Inicializa Terraform, usando la versión 1.5.7 y el proveedor Docker[cite: 10].
3.  [cite_start]**Terraform Apply**: Despliega el stack completo (App, Prometheus, Grafana)[cite: 7, 8].

-------------------------------------------------------
5. ACCESO A LOS SERVICIOS DESPLEGADOS
-------------------------------------------------------

Una vez completado el 'terraform apply', los servicios son accesibles en el host donde se ejecutó el despliegue a través de los puertos expuestos:

* [cite_start]**Aplicación**: http://localhost:8080 [cite: 3]
* [cite_start]**Prometheus**: http://localhost:9090 [cite: 7]
* [cite_start]**Grafana**: http://localhost:3000 [cite: 9]
