console.log("Hola soy JavaScript");

// promociones
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

// arreglo de los 4 nutricionistas
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
