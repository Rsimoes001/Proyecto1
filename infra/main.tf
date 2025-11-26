# infra/main.tf

# ----------------------------------------------------
# 1. Contenedor de la Aplicación (Proyecto 1)
# ----------------------------------------------------
resource "docker_container" "app_service" {
  # Nombre y Tag definidos en el workflow: proyecto1-app:latest
  name  = "proyecto1-app"
  image = "proyecto1-app:latest" # Debe coincidir con el tag construido en el pipeline
  
  # Mapeo de puerto para acceder a la App (http://localhost:8080)
  ports {
    internal = 8080
    external = 8080
  }

  # Configuración de reinicio y red (opcional)
  restart = "always"
}

# ----------------------------------------------------
# 2. Contenedor de Prometheus (Monitoreo)
# ----------------------------------------------------
resource "docker_container" "prometheus_server" {
  name  = "prometheus"
  image = "prom/prometheus:latest"
  
  # Mapeo de puerto para acceder al Dashboard (http://localhost:9090)
  ports {
    internal = 9090
    external = 9090
  }

  # Montar un volumen para la configuración de Prometheus
  volumes {
    host_path      = abspath("./prometheus.yml") # Ruta al archivo de configuración
    container_path = "/etc/prometheus/prometheus.yml"
    read_only      = true
  }
  
  # Dependencia: Prometheus se despliega después de la App
  depends_on = [docker_container.app_service]
}

# ----------------------------------------------------
# 3. Contenedor de Grafana (Visualización)
# ----------------------------------------------------
resource "docker_container" "grafana_dashboard" {
  name  = "grafana"
  image = "grafana/grafana:latest"
  
  # Mapeo de puerto para acceder al Dashboard (http://localhost:3000)
  ports {
    internal = 3000
    external = 3000
  }
  
  # Dependencia: Grafana se despliega después de Prometheus
  depends_on = [docker_container.prometheus_server]
}
