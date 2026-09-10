console.log("Hola soy JavaScript");

// Nitsi  - Promociones
const botonPromocion = document.getElementById("boton-promocion");
const promocion = document.getElementById("promocion");

if (botonPromocion && promocion) {
    botonPromocion.addEventListener("click", function(){
        promocion.classList.toggle("d-none");

        if (promocion.classList.contains("d-none")) {
            botonPromocion.textContent = "Mostrar promoción";
        } else {
            botonPromocion.textContent = "Ocultar promoción";
        }
    });
}

// Nitsi - Arreglo de los 4 nutricionistas
const nutricionistas = [
    {
        id: 1,
        nombre: "Dra. Camila Torres",
        especialidad: "Nutrición clínica y pérdida de peso",
        experiencia: "8 años de experiencia en tratamiento integral de sobrepeso y reeducación alimentaria.",
        foto: "img/nutricionista1.png",
        modalidad: "Presencial y online"
    },
    {
        id: 2,
        nombre: "Lic. Mateo Silva",
        especialidad: "Nutrición deportiva y alto rendimiento",
        experiencia: "Especialista en composición corporal y rendimiento físico para deportistas.",
        foto: "img/nutricionista2.png",
        modalidad: "Presencial"
    },
    {
        id: 3,
        nombre: "Dra. Valeria Rojas",
        especialidad: "Control de enfermedades metabólicas",
        experiencia: "Tratamiento personalizado para diabetes, hipertensión y dislipidemias.",
        foto: "img/nutricionista3.png",
        modalidad: "Presencial y online"
    },
    {
        id: 4,
        nombre: "Lic. Gabriel Morales",
        especialidad: "Alimentación vegetariana y vegana",
        experiencia: "Guía nutricional basada en plantas, suplementación B12 y balance de nutrientes.",
        foto: "img/nutricionista4.png",
        modalidad: "Online"
    }
];

const contenedor = document.getElementById("contenedor-nutricionistas");
const detalleModal = document.getElementById("detalle-nutricionista-info");

if (contenedor) {
    contenedor.innerHTML = "";

    nutricionistas.forEach(function(nutri){
        const article = document.createElement("article");
        article.className = "tarjeta";

        article.innerHTML = `
            <img src="${nutri.foto}" alt="${nutri.nombre}">
            <span class="etiqueta">${nutri.modalidad}</span>
            <h3 class="mt-2 mb-1">${nutri.nombre}</h3>
            <p class="precio mb-2">${nutri.especialidad}</p>
            <p class="text-muted small">${nutri.experiencia}</p>
            <button 
                class="btn btn-outline-primary w-100 mt-2 boton-agregar" 
                data-producto="${nutri.nombre}"
                data-id="${nutri.id}"
            >
                Ver detalle
            </button>
        `;

        contenedor.appendChild(article);
    });

    const botonesAgregar = document.querySelectorAll(".boton-agregar");

    botonesAgregar.forEach(function(boton){
        boton.addEventListener("click", function(){
            const idNutri = Number(boton.dataset.id);
            const encontrado = nutricionistas.find(n => n.id === idNutri);

            if (encontrado && detalleModal) {
                detalleModal.innerHTML = `
                    <div class="alert alert-success mt-3" role="alert">
                        <h4 class="alert-heading">${encontrado.nombre}</h4>
                        <p><strong>Especialidad:</strong> ${encontrado.especialidad}</p>
                        <p><strong>Modalidad:</strong> ${encontrado.modalidad}</p>
                        <hr>
                        <p class="mb-0">${encontrado.experiencia}</p>
                    </div>
                `;
            }
        });
    });
}



// Sofía - Agendamiento de citas

const formularioAgenda = document.getElementById("formulario-agenda");
const campoNutricionista = document.getElementById("nutricionista");
const campoMotivo = document.getElementById("motivo");
const campoFechaCita = document.getElementById("fecha-cita");
const campoHoraCita = document.getElementById("hora-cita");
const mensajeAgenda = document.getElementById("mensaje-agenda");
const listaCitas = document.getElementById("lista-citas");

if (formularioAgenda) {

    // Cargar citas guardadas o crear arreglo vacío
    let citas = JSON.parse(localStorage.getItem("citasNutriVida")) || [];

    function guardarCitas() {
        localStorage.setItem("citasNutriVida", JSON.stringify(citas));
    }

    function renderCitas() {
        listaCitas.innerHTML = "";

        if (citas.length === 0) {
            listaCitas.innerHTML = "<p class='text-muted'>No tienes citas agendadas.</p>";
            return;
        }

        citas.forEach(function (cita, indice) {
            const columna = document.createElement("div");
            columna.className = "col-12 col-md-6";

            columna.innerHTML = `
                <div class="card p-3">
                    <p class="mb-1">${cita.nutricionista}</p>
                    <p class="mb-1">${cita.motivo}</p>
                    <p class="mb-1">${cita.fecha} - ${cita.hora}</p>
                    <button class="btn btn-sm btn-outline-danger boton-cancelar" data-indice="${indice}">
                        Cancelar cita
                    </button>
                </div>
            `;

            listaCitas.appendChild(columna);
        });

        const botonesCancelar = document.querySelectorAll(".boton-cancelar");

        botonesCancelar.forEach(function (boton) {
            boton.addEventListener("click", function () {
                const indice = Number(boton.dataset.indice);
                citas.splice(indice, 1);
                guardarCitas();
                renderCitas();

                mensajeAgenda.textContent = "Cita cancelada correctamente";
                mensajeAgenda.className = "alert alert-warning mt-4";
            });
        });
    }

    formularioAgenda.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nutricionista = campoNutricionista.value;
        const motivo = campoMotivo.value.trim();
        const fecha = campoFechaCita.value;
        const hora = campoHoraCita.value;

        if (nutricionista === "" || motivo === "" || fecha === "" || hora === "") {
            mensajeAgenda.textContent = "Debe completar todos los campos";
            mensajeAgenda.className = "alert alert-danger mt-4";
            return;
        }

        const hoy = new Date().toISOString().split("T")[0];

        if (fecha < hoy) {
            mensajeAgenda.textContent = "No puede agendar una cita en una fecha pasada";
            mensajeAgenda.className = "alert alert-danger mt-4";
            return;
        }

        citas.push({ nutricionista, motivo, fecha, hora });
        guardarCitas();
        renderCitas();

        mensajeAgenda.textContent = "Cita agendada correctamente para " + nutricionista + " el " + fecha + " a las " + hora;
        mensajeAgenda.className = "alert alert-success mt-4";

        formularioAgenda.reset();
    });

    renderCitas();
}


// Sofía - Dashboard admin 

const statCitasHoy = document.getElementById("stat-citas-hoy");
const statPacientes = document.getElementById("stat-pacientes");
const statNutricionistas = document.getElementById("stat-nutricionistas");

if (statCitasHoy) {
    const citasGuardadas = JSON.parse(localStorage.getItem("citasNutriVida")) || [];
    const hoy = new Date().toISOString().split("T")[0];
    const citasDeHoy = citasGuardadas.filter(function (cita) {
        return cita.fecha === hoy;
    });

    statCitasHoy.textContent = citasDeHoy.length;
}

if (statPacientes) {
    const pacientesGuardados = JSON.parse(localStorage.getItem("pacientesNutriVida")) || [];
    statPacientes.textContent = pacientesGuardados.length;
}

if (statNutricionistas) {
    const nutricionistasGuardados = JSON.parse(localStorage.getItem("nutricionistasNutriVida")) || [];
    statNutricionistas.textContent = nutricionistasGuardados.length;
}

// Sofía - Listado de pacientes (admin)


const tablaPacientes = document.getElementById("tabla-pacientes");
const sinPacientes = document.getElementById("sin-pacientes");

if (tablaPacientes) {

    const pacientesPorDefecto = [
        { id: 1, nombre: "Ana Muñoz", apellidos: "Fuentes", correo: "ana.munoz@gmail.com", tipo: "Cliente" },
        { id: 2, nombre: "Diego Paredes", apellidos: "Reyes", correo: "diego.paredes@duoc.cl", tipo: "Cliente" },
        { id: 3, nombre: "Francisca Vidal", apellidos: "Concha", correo: "francisca.vidal@gmail.com", tipo: "Vendedor" }
    ];

    let pacientes = JSON.parse(localStorage.getItem("pacientesNutriVida")) || pacientesPorDefecto;

    function guardarPacientes() {
        localStorage.setItem("pacientesNutriVida", JSON.stringify(pacientes));
    }

    function renderPacientes() {
        tablaPacientes.innerHTML = "";

        if (pacientes.length === 0) {
            sinPacientes.classList.remove("d-none");
            return;
        }

        sinPacientes.classList.add("d-none");

        pacientes.forEach(function (paciente) {
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${paciente.nombre} ${paciente.apellidos}</td>
                <td>${paciente.correo}</td>
                <td><span class="badge admin-badge-tipo">${paciente.tipo}</span></td>
                <td class="text-end">
                    <a href="admin-form-paciente.html?id=${paciente.id}" class="btn btn-sm btn-outline-secondary me-1">
                        <i class="bi bi-pencil"></i>
                    </a>
                    <button class="btn btn-sm btn-outline-danger boton-eliminar-paciente" data-id="${paciente.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;

            tablaPacientes.appendChild(fila);
        });

        const botonesEliminar = document.querySelectorAll(".boton-eliminar-paciente");

        botonesEliminar.forEach(function (boton) {
            boton.addEventListener("click", function () {
                const id = Number(boton.dataset.id);

                const confirmar = confirm("¿Seguro que deseas eliminar este paciente?");
                if (!confirmar) {
                    return;
                }

                pacientes = pacientes.filter(function (p) {
                    return p.id !== id;
                });

                guardarPacientes();
                renderPacientes();
            });
        });
    }

    guardarPacientes();
    renderPacientes();
}