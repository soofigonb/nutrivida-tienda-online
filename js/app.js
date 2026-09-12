console.log("Hola soy JavaScript");

// Nitsi  - Promociones
const botonPromocion = document.getElementById("boton-promocion");
const promocion = document.getElementById("promocion");

if (botonPromocion && promocion) {
    botonPromocion.addEventListener("click", function () {
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

    nutricionistas.forEach(function (nutri) {
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

    botonesAgregar.forEach(function (boton) {
        boton.addEventListener("click", function () {
            const idNutri = Number(boton.dataset.id);
            const encontrado = nutricionistas.find(n => n.id === idNutri);

            if (encontrado && detalleModal) {
                detalleModal.innerHTML = `
                    <div class="alert alert-success mt-3 position-relative" role="alert">
                        <button type="button" class="btn-close position-absolute top-0 end-0 m-3" id="cerrar-detalle-nutri" aria-label="Cerrar detalle"></button>
                        <h4 class="alert-heading pe-4">${encontrado.nombre}</h4>
                        <p><strong>Especialidad:</strong> ${encontrado.especialidad}</p>
                        <p><strong>Modalidad:</strong> ${encontrado.modalidad}</p>
                        <hr>
                        <p class="mb-0">${encontrado.experiencia}</p>
                    </div>
                `;

                const btnCerrar = document.getElementById("cerrar-detalle-nutri");
                if (btnCerrar) {
                    btnCerrar.addEventListener("click", function () {
                        detalleModal.innerHTML = "";
                    });
                }
            }
        });
    });
}

// Sofía - Planes y servicios

const planesNutriVida = [
    {
        id: "consulta-inicial",
        nombre: "Evaluación y consulta inicial",
        descripcion: "Evaluación antropométrica, diagnóstico nutricional y pauta personalizada.",
        precio: 35000
    },
    {
        id: "plan-integral",
        nombre: "Plan nutricional integral",
        descripcion: "Incluye dos controles mensuales, seguimiento y guía de compras.",
        precio: 60000
    },
    {
        id: "nutricion-deportiva",
        nombre: "Plan de nutrición deportiva",
        descripcion: "Alimentación, suplementación y análisis del rendimiento.",
        precio: 50000
    }
];

// Sofía - Agendamiento de citas

const formularioAgenda = document.getElementById("formulario-agenda");
const campoPlanCita = document.getElementById("plan-cita");
const campoNutricionista = document.getElementById("nutricionista");
const campoMotivo = document.getElementById("motivo");
const campoFechaCita = document.getElementById("fecha-cita");
const campoHoraCita = document.getElementById("hora-cita");
const mensajeAgenda = document.getElementById("mensaje-agenda");


// Mostrar los precios con formato chileno.
function formatearPrecio(precio) {
    return "$" + Number(precio).toLocaleString("es-CL") + " CLP";
}

// Recuperar el carrito guardado o crear uno vacío.
function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carritoNutriVida")) || [];
}

// Guardar el carrito y actualizar el contador del navbar.
function guardarCarrito(carrito) {
    localStorage.setItem("carritoNutriVida", JSON.stringify(carrito));
    actualizarContadorCarrito();
}

// Mostrar la cantidad de consultas del carrito en todas las páginas.
function actualizarContadorCarrito() {
    const contadoresCarrito = document.querySelectorAll("#contador-carrito");
    const carrito = obtenerCarrito();

    contadoresCarrito.forEach(function (contador) {
        contador.textContent = carrito.length;
    });
}

actualizarContadorCarrito();

if (formularioAgenda) {
    // Establecer como fecha mínima el día actual.
    const hoy = new Date().toISOString().split("T")[0];
    campoFechaCita.min = hoy;

    // Leer el plan enviado desde index.html mediante ?plan=id-del-plan.
    const parametrosURL = new URLSearchParams(window.location.search);
    const idPlanRecibido = parametrosURL.get("plan");

    const planRecibido = planesNutriVida.find(function (plan) {
        return plan.id === idPlanRecibido;
    });

    // Preseleccionar el plan cuando el usuario viene desde una tarjeta de index.html.
    if (planRecibido && campoPlanCita) {
        campoPlanCita.value = planRecibido.id;
    }

    formularioAgenda.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const idPlan = campoPlanCita ? campoPlanCita.value : "";
        const idNutricionista = Number(campoNutricionista.value);
        const motivo = campoMotivo.value.trim();
        const fecha = campoFechaCita.value;
        const hora = campoHoraCita.value;

        if (
            idPlan === "" ||
            campoNutricionista.value === "" ||
            motivo === "" ||
            fecha === "" ||
            hora === ""
        ) {
            mensajeAgenda.textContent = "Debe completar todos los campos";
            mensajeAgenda.className = "alert alert-danger mt-4";
            return;
        }

        if (motivo.length < 5) {
            mensajeAgenda.textContent = "El motivo debe tener al menos 5 caracteres";
            mensajeAgenda.className = "alert alert-danger mt-4";
            return;
        }

        if (fecha < hoy) {
            mensajeAgenda.textContent = "No puede agendar una cita en una fecha pasada";
            mensajeAgenda.className = "alert alert-danger mt-4";
            return;
        }

        const planSeleccionado = planesNutriVida.find(function (plan) {
            return plan.id === idPlan;
        });

        const nutricionistaSeleccionado = nutricionistas.find(function (nutricionista) {
            return nutricionista.id === idNutricionista;
        });

        if (!planSeleccionado || !nutricionistaSeleccionado) {
            mensajeAgenda.textContent = "No fue posible encontrar el plan o el nutricionista";
            mensajeAgenda.className = "alert alert-danger mt-4";
            return;
        }

        const nuevaConsulta = {
            id: Date.now(),
            planId: planSeleccionado.id,
            servicio: planSeleccionado.nombre,
            precio: planSeleccionado.precio,
            nutricionistaId: nutricionistaSeleccionado.id,
            nutricionista: nutricionistaSeleccionado.nombre,
            motivo: motivo,
            fecha: fecha,
            hora: hora
        };

        const carrito = obtenerCarrito();
        carrito.push(nuevaConsulta);
        guardarCarrito(carrito);

        mensajeAgenda.textContent = "Consulta agregada al carrito correctamente";
        mensajeAgenda.className = "alert alert-success mt-4";

        formularioAgenda.reset();

        setTimeout(function () {
            window.location.href = "carrito.html";
        }, 800);
    });
}

// Sofía - Carrito simulado

const listaCarrito = document.getElementById("lista-carrito");
const mensajeCarritoVacio = document.getElementById("carrito-vacio");
const cantidadCarrito = document.getElementById("cantidad-carrito");
const totalCarrito = document.getElementById("total-carrito");
const botonConfirmarCarrito = document.getElementById("boton-confirmar-carrito");
const mensajeCarrito = document.getElementById("mensaje-carrito");

if (listaCarrito) {
    let carrito = obtenerCarrito();

    function renderCarrito() {
        listaCarrito.innerHTML = "";

        if (carrito.length === 1) {
            cantidadCarrito.textContent = "1 consulta";
        } else {
            cantidadCarrito.textContent = carrito.length + " consultas";
        }

        let total = 0;

        carrito.forEach(function (consulta) {
            total += consulta.precio;
        });

        totalCarrito.textContent = formatearPrecio(total);

        if (carrito.length === 0) {
            mensajeCarritoVacio.classList.remove("d-none");
            botonConfirmarCarrito.disabled = true;
            actualizarContadorCarrito();
            return;
        }

        mensajeCarritoVacio.classList.add("d-none");
        botonConfirmarCarrito.disabled = false;

        carrito.forEach(function (consulta) {
            const articulo = document.createElement("article");
            articulo.className = "carrito-item";

            articulo.innerHTML = `
                <div class="carrito-item-informacion">
                    <h3 class="carrito-item-servicio">${consulta.servicio}</h3>
                    <p class="carrito-item-dato">
                        <strong>Nutricionista:</strong> ${consulta.nutricionista}
                    </p>
                    <p class="carrito-item-dato">
                        <strong>Motivo:</strong> ${consulta.motivo}
                    </p>
                    <p class="carrito-item-dato">
                        <strong>Fecha:</strong> ${consulta.fecha}
                    </p>
                    <p class="carrito-item-dato">
                        <strong>Horario:</strong> ${consulta.hora} horas
                    </p>
                </div>

                <div class="carrito-item-acciones">
                    <p class="carrito-item-precio">
                        ${formatearPrecio(consulta.precio)}
                    </p>
                    <button type="button" class="carrito-eliminar" data-id="${consulta.id}">
                        <i class="bi bi-trash"></i>
                        Eliminar
                    </button>
                </div>
            `;

            listaCarrito.appendChild(articulo);
        });

        const botonesEliminarCarrito = document.querySelectorAll(".carrito-eliminar");

        botonesEliminarCarrito.forEach(function (boton) {
            boton.addEventListener("click", function () {
                const idConsulta = Number(boton.dataset.id);

                carrito = carrito.filter(function (consulta) {
                    return consulta.id !== idConsulta;
                });

                guardarCarrito(carrito);
                renderCarrito();
            });
        });

        actualizarContadorCarrito();
    }

    botonConfirmarCarrito.addEventListener("click", function () {
        if (carrito.length === 0) {
            return;
        }

        const citasGuardadas = JSON.parse(localStorage.getItem("citasNutriVida")) || [];

        carrito.forEach(function (consulta) {
            citasGuardadas.push(consulta);
        });

        localStorage.setItem("citasNutriVida", JSON.stringify(citasGuardadas));

        carrito = [];
        guardarCarrito(carrito);
        renderCarrito();

        mensajeCarrito.textContent = "Agendamiento confirmado correctamente";
        mensajeCarrito.className = "alert alert-success carrito-mensaje";

        setTimeout(function () {
            window.location.href = "agendar.html";
        }, 1200);
    });

    renderCarrito();
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
        {
            id: 1,
            nombre: "Ana",
            apellidos: "Muñoz Fuentes",
            run: "18.345.678-5",
            correo: "ana.munoz@gmail.com",
            fechaNacimiento: "1998-05-14",
            region: "La Araucanía",
            comuna: "Temuco",
            direccion: "Avenida Alemania 450"
        },
        {
            id: 2,
            nombre: "Diego",
            apellidos: "Paredes Reyes",
            run: "19.234.567-8",
            correo: "diego.paredes@duoc.cl",
            fechaNacimiento: "2000-09-22",
            region: "La Araucanía",
            comuna: "Padre Las Casas",
            direccion: "Villa Los Robles 235"
        },
        {
            id: 3,
            nombre: "Francisca",
            apellidos: "Vidal Concha",
            run: "17.456.789-2",
            correo: "francisca.vidal@gmail.com",
            fechaNacimiento: "1996-12-03",
            region: "La Araucanía",
            comuna: "Villarrica",
            direccion: "Calle Pedro de Valdivia 765"
        }
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
                <td>
                    <strong>
                        ${paciente.nombre} ${paciente.apellidos}
                    </strong>
                </td>

                <td>${paciente.run}</td>

                <td>${paciente.correo}</td>

                <td>${paciente.fechaNacimiento}</td>

                <td>${paciente.region}</td>

                <td>
                    <span class="admin-badge-tipo">
                        ${paciente.comuna}
                    </span>
                </td>

                <td>${paciente.direccion}</td>

                <td class="text-end">

                    <a href="admin-form-paciente.html?id=${paciente.id}"
                        class="btn btn-sm btn-outline-secondary me-1"
                        aria-label="Editar a ${paciente.nombre}">

                        <i class="bi bi-pencil"></i>
                    </a>

                    <button type="button"
                        class="btn btn-sm btn-outline-danger boton-eliminar-paciente"
                        data-id="${paciente.id}"
                        aria-label="Eliminar a ${paciente.nombre}">

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


// Sofía - Listado de nutricionistas (admin)


const tablaNutricionistasAdmin = document.getElementById("tabla-nutricionistas");
const sinNutricionistas = document.getElementById("sin-nutricionistas");

if (tablaNutricionistasAdmin) {

    const nutricionistasPorDefecto = [
        { id: 1, nombre: "Dra. Camila Torres", especialidad: "Nutrición clínica y pérdida de peso", modalidad: "Presencial y online" },
        { id: 2, nombre: "Lic. Mateo Silva", especialidad: "Nutrición deportiva y alto rendimiento", modalidad: "Presencial" },
        { id: 3, nombre: "Dra. Valeria Rojas", especialidad: "Control de enfermedades metabólicas", modalidad: "Presencial y online" },
        { id: 4, nombre: "Lic. Gabriel Morales", especialidad: "Alimentación vegetariana y vegana", modalidad: "Online" }
    ];

    let nutricionistasAdmin = JSON.parse(localStorage.getItem("nutricionistasNutriVida")) || nutricionistasPorDefecto;

    function guardarNutricionistasAdmin() {
        localStorage.setItem("nutricionistasNutriVida", JSON.stringify(nutricionistasAdmin));
    }

    function renderNutricionistasAdmin() {
        tablaNutricionistasAdmin.innerHTML = "";

        if (nutricionistasAdmin.length === 0) {
            sinNutricionistas.classList.remove("d-none");
            return;
        }

        sinNutricionistas.classList.add("d-none");

        nutricionistasAdmin.forEach(function (nutri) {
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${nutri.nombre}</td>
                <td>${nutri.especialidad}</td>
                <td><span class="badge admin-badge-tipo">${nutri.modalidad}</span></td>
                <td class="text-end">
                    <div class="d-flex justify-content-end gap-1">
                        <a href="admin-form-nutricionista.html?id=${nutri.id}" class="btn btn-sm btn-outline-secondary">
                            <i class="bi bi-pencil"></i>
                        </a>
                        <button class="btn btn-sm btn-outline-danger boton-eliminar-nutricionista" data-id="${nutri.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            tablaNutricionistasAdmin.appendChild(fila);
        });

        const botonesEliminarNutri = document.querySelectorAll(".boton-eliminar-nutricionista");

        botonesEliminarNutri.forEach(function (boton) {
            boton.addEventListener("click", function () {
                const id = Number(boton.dataset.id);

                const confirmar = confirm("¿Seguro que deseas eliminar este nutricionista?");
                if (!confirmar) {
                    return;
                }

                nutricionistasAdmin = nutricionistasAdmin.filter(function (n) {
                    return n.id !== id;
                });

                guardarNutricionistasAdmin();
                renderNutricionistasAdmin();
            });
        });
    }

    guardarNutricionistasAdmin();
    renderNutricionistasAdmin();
}

// Sofía - Formulario nuevo / editar nutricionista (admin)


const formNutricionista = document.getElementById("form-nutricionista");

if (formNutricionista) {

    const parametros = new URLSearchParams(window.location.search);
    const idEditar = parametros.get("id") ? Number(parametros.get("id")) : null;

    let nutricionistasForm = JSON.parse(localStorage.getItem("nutricionistasNutriVida")) || [];

    const tituloForm = document.getElementById("titulo-form-nutricionista");
    const campoNombre = document.getElementById("nutri-nombre");
    const campoEspecialidad = document.getElementById("nutri-especialidad");
    const campoModalidad = document.getElementById("nutri-modalidad");
    const mensajeForm = document.getElementById("mensaje-form-nutricionista");

    if (idEditar !== null) {
        const nutriExistente = nutricionistasForm.find(function (n) {
            return n.id === idEditar;
        });

        if (nutriExistente) {
            tituloForm.textContent = "Editar nutricionista";
            campoNombre.value = nutriExistente.nombre;
            campoEspecialidad.value = nutriExistente.especialidad;
            campoModalidad.value = nutriExistente.modalidad;
        }
    }

    formNutricionista.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nombre = campoNombre.value.trim();
        const especialidad = campoEspecialidad.value.trim();
        const modalidad = campoModalidad.value;

        // Validación básica. Reemplazar por las funciones de validación de Jonathan (en este mismo app.js)
        if (nombre === "" || especialidad === "" || modalidad === "") {
            mensajeForm.textContent = "Debe completar todos los campos";
            mensajeForm.className = "alert alert-danger mt-3";
            return;
        }

        if (idEditar !== null) {
            nutricionistasForm = nutricionistasForm.map(function (n) {
                if (n.id === idEditar) {
                    return { id: n.id, nombre, especialidad, modalidad };
                }
                return n;
            });
        } else {
            const nuevoId = nutricionistasForm.length > 0
                ? Math.max.apply(null, nutricionistasForm.map(function (n) { return n.id; })) + 1
                : 1;
            nutricionistasForm.push({ id: nuevoId, nombre, especialidad, modalidad });
        }

        localStorage.setItem("nutricionistasNutriVida", JSON.stringify(nutricionistasForm));
        window.location.href = "admin-nutricionistas.html";
    });
}

// Sofía - Formulario nuevo / editar paciente (admin)

const formPaciente = document.getElementById("form-paciente");

if (formPaciente) {

    const parametros =
        new URLSearchParams(window.location.search);

    const idEditar = parametros.get("id")
        ? Number(parametros.get("id"))
        : null;

    let pacientes =
        JSON.parse(localStorage.getItem("pacientesNutriVida")) || [];

    const tituloForm =
        document.getElementById("titulo-form-paciente");

    const campoNombre =
        document.getElementById("paciente-nombre");

    const campoApellidos =
        document.getElementById("paciente-apellidos");

    const campoRun =
        document.getElementById("paciente-run");

    const campoCorreo =
        document.getElementById("paciente-correo");

    const campoFechaNacimiento =
        document.getElementById("paciente-fecha-nacimiento");

    const campoRegion =
        document.getElementById("paciente-region");

    const campoComuna =
        document.getElementById("paciente-comuna");

    const campoDireccion =
        document.getElementById("paciente-direccion");

    const mensajeForm =
        document.getElementById("mensaje-form-paciente");

    const comunasPorRegion = {
        "Valparaíso": [
            "Valparaíso",
            "Viña del Mar",
            "Quilpué",
            "Villa Alemana"
        ],
        "Metropolitana": [
            "Santiago",
            "Providencia",
            "Ñuñoa",
            "Maipú"
        ],
        "La Araucanía": [
            "Temuco",
            "Padre Las Casas",
            "Villarrica",
            "Pucón"
        ]
    };

    function cargarComunas(region, comunaSeleccionada) {
        campoComuna.innerHTML =
            '<option value="">Seleccione una comuna</option>';

        if (!region || !comunasPorRegion[region]) {
            campoComuna.disabled = true;
            return;
        }

        campoComuna.disabled = false;

        comunasPorRegion[region].forEach(function (comuna) {
            const opcion = document.createElement("option");

            opcion.value = comuna;
            opcion.textContent = comuna;

            if (comuna === comunaSeleccionada) {
                opcion.selected = true;
            }

            campoComuna.appendChild(opcion);
        });
    }

    campoRegion.addEventListener("change", function () {
        cargarComunas(campoRegion.value, "");
    });

    if (idEditar !== null) {
        const pacienteExistente = pacientes.find(function (paciente) {
            return paciente.id === idEditar;
        });

        if (pacienteExistente) {
            tituloForm.textContent = "Editar paciente";

            campoNombre.value =
                pacienteExistente.nombre || "";

            campoApellidos.value =
                pacienteExistente.apellidos || "";

            campoRun.value =
                pacienteExistente.run || "";

            campoCorreo.value =
                pacienteExistente.correo || "";

            campoFechaNacimiento.value =
                pacienteExistente.fechaNacimiento || "";

            campoRegion.value =
                pacienteExistente.region || "";

            cargarComunas(
                pacienteExistente.region,
                pacienteExistente.comuna
            );

            campoDireccion.value =
                pacienteExistente.direccion || "";
        }
    }

    formPaciente.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nombre = campoNombre.value.trim();
        const apellidos = campoApellidos.value.trim();
        const run = campoRun.value.trim();
        const correo = campoCorreo.value.trim();
        const fechaNacimiento = campoFechaNacimiento.value;
        const region = campoRegion.value;
        const comuna = campoComuna.value;
        const direccion = campoDireccion.value.trim();

        if (
            nombre === "" ||
            apellidos === "" ||
            run === "" ||
            correo === "" ||
            region === "" ||
            comuna === "" ||
            direccion === ""
        ) {
            mensajeForm.textContent =
                "Debe completar todos los campos obligatorios";

            mensajeForm.className =
                "alert alert-danger admin-form-mensaje";

            return;
        }

        const correoValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

        if (!correoValido) {
            mensajeForm.textContent =
                "Debe ingresar un correo electrónico válido";

            mensajeForm.className =
                "alert alert-danger admin-form-mensaje";

            return;
        }

        const datosPaciente = {
            nombre: nombre,
            apellidos: apellidos,
            run: run,
            correo: correo,
            fechaNacimiento: fechaNacimiento,
            region: region,
            comuna: comuna,
            direccion: direccion
        };

        if (idEditar !== null) {

            pacientes = pacientes.map(function (paciente) {
                if (paciente.id === idEditar) {
                    return {
                        id: paciente.id,
                        ...datosPaciente
                    };
                }

                return paciente;
            });

        } else {

            const nuevoId = pacientes.length > 0
                ? Math.max.apply(
                    null,
                    pacientes.map(function (paciente) {
                        return paciente.id;
                    })
                ) + 1
                : 1;

            pacientes.push({
                id: nuevoId,
                ...datosPaciente
            });
        }

        localStorage.setItem(
            "pacientesNutriVida",
            JSON.stringify(pacientes)
        );

        window.location.href = "admin-pacientes.html";
    });
}

// VALIDACIONES REUTILIZABLES DEL PROYECTO
// Jonathan - Login, registro y contacto
// Reutilizadas en los formularios administrativos


const dominiosCorreoPermitidos = [
    "@duoc.cl",
    "@profesor.duoc.cl",
    "@gmail.com"
];

function validarLargo(texto, minimo, maximo) {
    const valor = texto.trim();
    return valor.length >= minimo && valor.length <= maximo;
}

function validarCorreo(correo) {
    const valor = correo.trim().toLowerCase();

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(valor)) {
        return false;
    }

    if (valor.length > 100) {
        return false;
    }

    return dominiosCorreoPermitidos.some(function (dominio) {
        return valor.endsWith(dominio);
    });
}

function validarRUN(run) {
    const runLimpio = run
        .replace(/\./g, "")
        .replace(/-/g, "")
        .toUpperCase();

    if (!/^[0-9]{7,8}[0-9K]$/.test(runLimpio)) {
        return false;
    }

    const cuerpo = runLimpio.slice(0, -1);
    const digitoIngresado = runLimpio.slice(-1);

    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * multiplicador;

        multiplicador++;

        if (multiplicador === 8) {
            multiplicador = 2;
        }
    }

    const resto = 11 - (suma % 11);

    let digitoCalculado;

    if (resto === 11) {
        digitoCalculado = "0";
    } else if (resto === 10) {
        digitoCalculado = "K";
    } else {
        digitoCalculado = String(resto);
    }

    return digitoCalculado === digitoIngresado;
}

function mostrarEstadoCampo(campo, elementoError, mensaje) {
    if (!campo || !elementoError) {
        return false;
    }

    elementoError.textContent = mensaje;
    campo.classList.remove("is-valid");
    campo.classList.add("is-invalid");

    return false;
}

function mostrarCampoValido(campo, elementoError) {
    if (!campo || !elementoError) {
        return true;
    }

    elementoError.textContent = "";
    campo.classList.remove("is-invalid");
    campo.classList.add("is-valid");

    return true;
}

function limpiarEstadoCampo(campo, elementoError) {
    if (!campo || !elementoError) {
        return;
    }

    elementoError.textContent = "";
    campo.classList.remove("is-invalid", "is-valid");
}

function validarCampoTexto(
    campo,
    elementoError,
    nombreCampo,
    minimo,
    maximo
) {
    const valor = campo.value.trim();

    if (valor === "") {
        return mostrarEstadoCampo(
            campo,
            elementoError,
            nombreCampo + " es obligatorio."
        );
    }

    if (!validarLargo(valor, minimo, maximo)) {
        return mostrarEstadoCampo(
            campo,
            elementoError,
            nombreCampo +
            " debe tener entre " +
            minimo +
            " y " +
            maximo +
            " caracteres."
        );
    }

    return mostrarCampoValido(campo, elementoError);
}

function validarCampoCorreo(campo, elementoError) {
    const valor = campo.value.trim();

    if (valor === "") {
        return mostrarEstadoCampo(
            campo,
            elementoError,
            "El correo electrónico es obligatorio."
        );
    }

    if (valor.length > 100) {
        return mostrarEstadoCampo(
            campo,
            elementoError,
            "El correo no puede superar los 100 caracteres."
        );
    }

    if (!validarCorreo(valor)) {
        return mostrarEstadoCampo(
            campo,
            elementoError,
            "Utiliza un correo @duoc.cl, @profesor.duoc.cl o @gmail.com."
        );
    }

    return mostrarCampoValido(campo, elementoError);
}

function validarCampoRUN(campo, elementoError) {
    const valor = campo.value.trim();

    if (valor === "") {
        return mostrarEstadoCampo(
            campo,
            elementoError,
            "El RUN es obligatorio."
        );
    }

    if (!validarRUN(valor)) {
        return mostrarEstadoCampo(
            campo,
            elementoError,
            "Ingresa un RUN válido, sin puntos ni guion."
        );
    }

    return mostrarCampoValido(campo, elementoError);
}


// ================================================================
// VALIDACIÓN DEL LOGIN
// ================================================================

const formularioLogin = document.getElementById("formulario-login");

if (formularioLogin) {
    const correoLogin = document.getElementById("correo-login");
    const contrasenaLogin = document.getElementById("contrasena-login");

    const errorCorreoLogin =
        document.getElementById("error-correo-login");

    const errorContrasenaLogin =
        document.getElementById("error-contrasena-login");

    const mensajeLogin =
        document.getElementById("mensaje-login");

    function comprobarCorreoLogin() {
        return validarCampoCorreo(
            correoLogin,
            errorCorreoLogin
        );
    }

    function comprobarContrasenaLogin() {
        const contrasena = contrasenaLogin.value;

        if (contrasena === "") {
            return mostrarEstadoCampo(
                contrasenaLogin,
                errorContrasenaLogin,
                "La contraseña es obligatoria."
            );
        }

        if (contrasena.length < 4 || contrasena.length > 10) {
            return mostrarEstadoCampo(
                contrasenaLogin,
                errorContrasenaLogin,
                "La contraseña debe tener entre 4 y 10 caracteres."
            );
        }

        return mostrarCampoValido(
            contrasenaLogin,
            errorContrasenaLogin
        );
    }

    correoLogin.addEventListener("input", comprobarCorreoLogin);
    correoLogin.addEventListener("blur", comprobarCorreoLogin);

    contrasenaLogin.addEventListener(
        "input",
        comprobarContrasenaLogin
    );

    contrasenaLogin.addEventListener(
        "blur",
        comprobarContrasenaLogin
    );

    formularioLogin.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const correoCorrecto = comprobarCorreoLogin();
        const contrasenaCorrecta = comprobarContrasenaLogin();

        if (!correoCorrecto || !contrasenaCorrecta) {
            mensajeLogin.textContent =
                "Revisa los datos antes de iniciar sesión.";

            mensajeLogin.className = "alert alert-danger mt-3";
            return;
        }

        const sesion = {
            correo: correoLogin.value.trim(),
            fechaIngreso: new Date().toISOString()
        };

        localStorage.setItem(
            "sesionNutriVida",
            JSON.stringify(sesion)
        );

        mensajeLogin.textContent =
            "Inicio de sesión realizado correctamente.";

        mensajeLogin.className = "alert alert-success mt-3";

        setTimeout(function () {
            window.location.href = "index.html";
        }, 1000);
    });
}


// ================================================================
// REGIONES Y COMUNAS DEL REGISTRO
// ================================================================

const comunasRegistroPorRegion = {
    "Los Ríos": [
        "Valdivia",
        "La Unión",
        "Panguipulli",
        "Río Bueno"
    ],

    "Los Lagos": [
        "Puerto Montt",
        "Puerto Varas",
        "Osorno",
        "Castro"
    ],

    "La Araucanía": [
        "Temuco",
        "Padre Las Casas",
        "Villarrica",
        "Pucón"
    ],

    "Valparaíso": [
        "Valparaíso",
        "Viña del Mar",
        "Quilpué",
        "Villa Alemana"
    ]
};

function actualizarComunasRegistro(
    campoRegion,
    campoComuna,
    comunaSeleccionada
) {
    campoComuna.innerHTML =
        '<option value="">Seleccione una comuna</option>';

    const regionSeleccionada = campoRegion.value;
    const comunas = comunasRegistroPorRegion[regionSeleccionada];

    if (!comunas) {
        campoComuna.disabled = true;
        return;
    }

    campoComuna.disabled = false;

    comunas.forEach(function (comuna) {
        const opcion = document.createElement("option");

        opcion.value = comuna;
        opcion.textContent = comuna;

        if (comuna === comunaSeleccionada) {
            opcion.selected = true;
        }

        campoComuna.appendChild(opcion);
    });
}


// ================================================================
// VALIDACIÓN DEL REGISTRO
// ================================================================

const formularioRegistro =
    document.getElementById("formulario-registro");

if (formularioRegistro) {
    const nombreRegistro =
        document.getElementById("nombre-registro");

    const apellidosRegistro =
        document.getElementById("apellidos-registro");

    const runRegistro =
        document.getElementById("run-registro");

    const fechaNacimientoRegistro =
        document.getElementById("fecha-nacimiento-registro");

    const correoRegistro =
        document.getElementById("correo-registro");

    const telefonoRegistro =
        document.getElementById("telefono-registro");

    const contrasenaRegistro =
        document.getElementById("contrasena-registro");

    const confirmarContrasenaRegistro =
        document.getElementById("confirmar-contrasena-registro");

    const regionRegistro =
        document.getElementById("region-registro");

    const comunaRegistro =
        document.getElementById("comuna-registro");

    const direccionRegistro =
        document.getElementById("direccion-registro");

    const errorNombreRegistro =
        document.getElementById("error-nombre-registro");

    const errorApellidosRegistro =
        document.getElementById("error-apellidos-registro");

    const errorRunRegistro =
        document.getElementById("error-run-registro");

    const errorCorreoRegistro =
        document.getElementById("error-correo-registro");

    const errorTelefonoRegistro =
        document.getElementById("error-telefono-registro");

    const errorContrasenaRegistro =
        document.getElementById("error-contrasena-registro");

    const errorConfirmarContrasenaRegistro =
        document.getElementById(
            "error-confirmar-contrasena-registro"
        );

    const errorRegionRegistro =
        document.getElementById("error-region-registro");

    const errorComunaRegistro =
        document.getElementById("error-comuna-registro");

    const errorDireccionRegistro =
        document.getElementById("error-direccion-registro");

    const mensajeRegistro =
        document.getElementById("mensaje-registro");

    function comprobarNombreRegistro() {
        return validarCampoTexto(
            nombreRegistro,
            errorNombreRegistro,
            "El nombre",
            2,
            50
        );
    }

    function comprobarApellidosRegistro() {
        return validarCampoTexto(
            apellidosRegistro,
            errorApellidosRegistro,
            "Los apellidos",
            2,
            100
        );
    }

    function comprobarRUNRegistro() {
        return validarCampoRUN(
            runRegistro,
            errorRunRegistro
        );
    }

    function comprobarCorreoRegistro() {
        return validarCampoCorreo(
            correoRegistro,
            errorCorreoRegistro
        );
    }

    function comprobarTelefonoRegistro() {
        const telefonoLimpio =
            telefonoRegistro.value.replace(/\D/g, "");

        if (telefonoRegistro.value.trim() === "") {
            return mostrarEstadoCampo(
                telefonoRegistro,
                errorTelefonoRegistro,
                "El teléfono es obligatorio."
            );
        }

        if (
            telefonoLimpio.length < 8 ||
            telefonoLimpio.length > 12
        ) {
            return mostrarEstadoCampo(
                telefonoRegistro,
                errorTelefonoRegistro,
                "El teléfono debe contener entre 8 y 12 números."
            );
        }

        return mostrarCampoValido(
            telefonoRegistro,
            errorTelefonoRegistro
        );
    }

    function comprobarContrasenaRegistro() {
        const contrasena = contrasenaRegistro.value;

        if (contrasena === "") {
            return mostrarEstadoCampo(
                contrasenaRegistro,
                errorContrasenaRegistro,
                "La contraseña es obligatoria."
            );
        }

        if (contrasena.length < 4 || contrasena.length > 10) {
            return mostrarEstadoCampo(
                contrasenaRegistro,
                errorContrasenaRegistro,
                "La contraseña debe tener entre 4 y 10 caracteres."
            );
        }

        return mostrarCampoValido(
            contrasenaRegistro,
            errorContrasenaRegistro
        );
    }

    function comprobarConfirmacionContrasena() {
        const confirmacion = confirmarContrasenaRegistro.value;

        if (confirmacion === "") {
            return mostrarEstadoCampo(
                confirmarContrasenaRegistro,
                errorConfirmarContrasenaRegistro,
                "Debes confirmar la contraseña."
            );
        }

        if (confirmacion !== contrasenaRegistro.value) {
            return mostrarEstadoCampo(
                confirmarContrasenaRegistro,
                errorConfirmarContrasenaRegistro,
                "Las contraseñas no coinciden."
            );
        }

        return mostrarCampoValido(
            confirmarContrasenaRegistro,
            errorConfirmarContrasenaRegistro
        );
    }

    function comprobarRegionRegistro() {
        if (regionRegistro.value === "") {
            return mostrarEstadoCampo(
                regionRegistro,
                errorRegionRegistro,
                "Debes seleccionar una región."
            );
        }

        return mostrarCampoValido(
            regionRegistro,
            errorRegionRegistro
        );
    }

    function comprobarComunaRegistro() {
        if (comunaRegistro.value === "") {
            return mostrarEstadoCampo(
                comunaRegistro,
                errorComunaRegistro,
                "Debes seleccionar una comuna."
            );
        }

        return mostrarCampoValido(
            comunaRegistro,
            errorComunaRegistro
        );
    }

    function comprobarDireccionRegistro() {
        return validarCampoTexto(
            direccionRegistro,
            errorDireccionRegistro,
            "La dirección",
            3,
            300
        );
    }

    nombreRegistro.addEventListener(
        "input",
        comprobarNombreRegistro
    );

    apellidosRegistro.addEventListener(
        "input",
        comprobarApellidosRegistro
    );

    runRegistro.addEventListener(
        "input",
        comprobarRUNRegistro
    );

    correoRegistro.addEventListener(
        "input",
        comprobarCorreoRegistro
    );

    telefonoRegistro.addEventListener(
        "input",
        comprobarTelefonoRegistro
    );

    contrasenaRegistro.addEventListener("input", function () {
        comprobarContrasenaRegistro();

        if (confirmarContrasenaRegistro.value !== "") {
            comprobarConfirmacionContrasena();
        }
    });

    confirmarContrasenaRegistro.addEventListener(
        "input",
        comprobarConfirmacionContrasena
    );

    regionRegistro.addEventListener("change", function () {
        actualizarComunasRegistro(
            regionRegistro,
            comunaRegistro,
            ""
        );

        comprobarRegionRegistro();
        limpiarEstadoCampo(
            comunaRegistro,
            errorComunaRegistro
        );
    });

    comunaRegistro.addEventListener(
        "change",
        comprobarComunaRegistro
    );

    direccionRegistro.addEventListener(
        "input",
        comprobarDireccionRegistro
    );

    formularioRegistro.addEventListener(
        "submit",
        function (evento) {
            evento.preventDefault();

            const nombreCorrecto = comprobarNombreRegistro();
            const apellidosCorrectos =
                comprobarApellidosRegistro();

            const runCorrecto = comprobarRUNRegistro();
            const correoCorrecto = comprobarCorreoRegistro();
            const telefonoCorrecto =
                comprobarTelefonoRegistro();

            const contrasenaCorrecta =
                comprobarContrasenaRegistro();

            const confirmacionCorrecta =
                comprobarConfirmacionContrasena();

            const regionCorrecta = comprobarRegionRegistro();
            const comunaCorrecta = comprobarComunaRegistro();
            const direccionCorrecta =
                comprobarDireccionRegistro();

            const formularioCorrecto =
                nombreCorrecto &&
                apellidosCorrectos &&
                runCorrecto &&
                correoCorrecto &&
                telefonoCorrecto &&
                contrasenaCorrecta &&
                confirmacionCorrecta &&
                regionCorrecta &&
                comunaCorrecta &&
                direccionCorrecta;

            if (!formularioCorrecto) {
                mensajeRegistro.textContent =
                    "Revisa los campos marcados antes de registrarte.";

                mensajeRegistro.className =
                    "alert alert-danger mt-3";

                return;
            }

            let pacientesRegistrados =
                JSON.parse(
                    localStorage.getItem("pacientesNutriVida")
                ) || [];

            const correoIngresado =
                correoRegistro.value.trim().toLowerCase();

            const runIngresado =
                runRegistro.value
                    .replace(/\./g, "")
                    .replace(/-/g, "")
                    .toUpperCase();

            const correoRepetido =
                pacientesRegistrados.some(function (paciente) {
                    return (
                        paciente.correo &&
                        paciente.correo.toLowerCase() ===
                        correoIngresado
                    );
                });

            const runRepetido =
                pacientesRegistrados.some(function (paciente) {
                    const runGuardado = String(
                        paciente.run || ""
                    )
                        .replace(/\./g, "")
                        .replace(/-/g, "")
                        .toUpperCase();

                    return runGuardado === runIngresado;
                });

            if (correoRepetido) {
                mostrarEstadoCampo(
                    correoRegistro,
                    errorCorreoRegistro,
                    "Este correo ya se encuentra registrado."
                );

                return;
            }

            if (runRepetido) {
                mostrarEstadoCampo(
                    runRegistro,
                    errorRunRegistro,
                    "Este RUN ya se encuentra registrado."
                );

                return;
            }

            const nuevoId =
                pacientesRegistrados.length > 0
                    ? Math.max.apply(
                        null,
                        pacientesRegistrados.map(
                            function (paciente) {
                                return Number(paciente.id) || 0;
                            }
                        )
                    ) + 1
                    : 1;

            const nuevoPaciente = {
                id: nuevoId,
                nombre: nombreRegistro.value.trim(),
                apellidos: apellidosRegistro.value.trim(),
                run: runIngresado,
                correo: correoIngresado,
                telefono: telefonoRegistro.value.trim(),
                contrasena: contrasenaRegistro.value,
                fechaNacimiento:
                    fechaNacimientoRegistro.value,
                region: regionRegistro.value,
                comuna: comunaRegistro.value,
                direccion: direccionRegistro.value.trim()
            };

            pacientesRegistrados.push(nuevoPaciente);

            localStorage.setItem(
                "pacientesNutriVida",
                JSON.stringify(pacientesRegistrados)
            );

            mensajeRegistro.textContent =
                "Paciente registrado correctamente.";

            mensajeRegistro.className =
                "alert alert-success mt-3";

            formularioRegistro.reset();
            comunaRegistro.disabled = true;

            formularioRegistro
                .querySelectorAll(".is-valid, .is-invalid")
                .forEach(function (campo) {
                    campo.classList.remove(
                        "is-valid",
                        "is-invalid"
                    );
                });

            setTimeout(function () {
                window.location.href = "login.html";
            }, 1200);
        }
    );
}


// ================================================================
// VALIDACIÓN DEL FORMULARIO DE CONTACTO
// ================================================================

const formularioContacto =
    document.getElementById("formulario-contacto");

if (formularioContacto) {
    const nombreContacto =
        document.getElementById("nombre-contacto");

    const correoContacto =
        document.getElementById("correo-contacto");

    const mensajeContacto =
        document.getElementById("mensaje-contacto");

    const errorNombreContacto =
        document.getElementById("error-nombre-contacto");

    const errorCorreoContacto =
        document.getElementById("error-correo-contacto");

    const errorMensajeContacto =
        document.getElementById("error-mensaje-contacto");

    const resultadoContacto =
        document.getElementById("mensaje-contacto-resultado");

    function comprobarNombreContacto() {
        return validarCampoTexto(
            nombreContacto,
            errorNombreContacto,
            "El nombre",
            2,
            100
        );
    }

    function comprobarCorreoContacto() {
        return validarCampoCorreo(
            correoContacto,
            errorCorreoContacto
        );
    }

    function comprobarMensajeContacto() {
        return validarCampoTexto(
            mensajeContacto,
            errorMensajeContacto,
            "El mensaje",
            2,
            500
        );
    }

    nombreContacto.addEventListener(
        "input",
        comprobarNombreContacto
    );

    nombreContacto.addEventListener(
        "blur",
        comprobarNombreContacto
    );

    correoContacto.addEventListener(
        "input",
        comprobarCorreoContacto
    );

    correoContacto.addEventListener(
        "blur",
        comprobarCorreoContacto
    );

    mensajeContacto.addEventListener(
        "input",
        comprobarMensajeContacto
    );

    mensajeContacto.addEventListener(
        "blur",
        comprobarMensajeContacto
    );

    formularioContacto.addEventListener(
        "submit",
        function (evento) {
            evento.preventDefault();

            const nombreCorrecto =
                comprobarNombreContacto();

            const correoCorrecto =
                comprobarCorreoContacto();

            const mensajeCorrecto =
                comprobarMensajeContacto();

            if (
                !nombreCorrecto ||
                !correoCorrecto ||
                !mensajeCorrecto
            ) {
                resultadoContacto.textContent =
                    "Revisa los campos marcados.";

                resultadoContacto.className =
                    "alert alert-danger mt-3";

                return;
            }

            resultadoContacto.textContent =
                "Tu formulario de contacto fue enviado correctamente.";

            resultadoContacto.className =
                "alert alert-success mt-3";

            formularioContacto.reset();

            formularioContacto
                .querySelectorAll(".is-valid, .is-invalid")
                .forEach(function (campo) {
                    campo.classList.remove(
                        "is-valid",
                        "is-invalid"
                    );
                });
        }
    );
}