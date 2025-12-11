# infra/main.tf - CORREGIDO

# ----------------------------------------------------
# 0. Red de Docker para los servicios (SOLUCIÓN)
# ----------------------------------------------------
# Definimos una red de usuario. Esto activa el DNS interno de Docker,
# permitiendo que los contenedores se comuniquen usando sus nombres.
resource "docker_network" "monitoring_network" {
  name            = "monitoring-net"
  check_duplicate = true
}


# ----------------------------------------------------
# 1. Contenedor de la Aplicación (Proyecto 1)
# ----------------------------------------------------
resource "docker_container" "app_service" {
  name  = "proyecto1-app"
  image = "proyecto1-app:latest"

  # CONEXIÓN: Agregamos el contenedor a la red de monitoreo
  networks_advanced {
    name = docker_network.monitoring_network.name
  }

  ports {
    internal = 8080
    external = 8080
  }
  restart = "always"
}

# ----------------------------------------------------
# 2. Contenedor de Prometheus (Monitoreo)
# ----------------------------------------------------
resource "docker_container" "prometheus_server" {
  name  = "prometheus"
  image = "prom/prometheus:latest"

  # CONEXIÓN: Agregamos el contenedor a la red de monitoreo
  networks_advanced {
    name = docker_network.monitoring_network.name
  }

  ports {
    internal = 9090
    external = 9090
  }

  volumes {
    host_path      = abspath("./prometheus.yml")
    container_path = "/etc/prometheus/prometheus.yml"
    read_only      = true
  }

  depends_on = [docker_container.app_service]
}

# ----------------------------------------------------
# 3. Contenedor de Grafana (Visualización)
# ----------------------------------------------------
resource "docker_container" "grafana_dashboard" {
  name  = "grafana"
  image = "grafana/grafana:latest"

  # CONEXIÓN: Agregamos el contenedor a la red de monitoreo
  # Grafana ahora podrá resolver 'prometheus' gracias a esta red.
  networks_advanced {
    name = docker_network.monitoring_network.name
  }

  ports {
    internal = 3000
    external = 3000
  }

  depends_on = [docker_container.prometheus_server]
}
