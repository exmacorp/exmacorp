// variables y selectores
const formulario = document.querySelector('#agregar-gasto');
const gastoslistado = document.querySelector('#gastos ul');
const buttonPresupuesto = document.querySelector('#buttonPresupuesto');
const button = document.querySelector('#button');


//eventos
eventListeners();
function eventListeners(){
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);

    formulario.addEventListener('submit', agregarGasto);
    buttonPresupuesto.addEventListener('click', preguntarPresupuesto);
    gastoslistado.addEventListener('click', eliminarGasto);
}

//clases
class Presupuesto{
    constructor(presupuesto){
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto){
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    eliminarGasto(id) {
        this.gastos = this.gastos.filter( gasto => gasto.id.toString() !== id );
        this.calcularRestante();
    }

    calcularRestante(){
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0)
        this.restante = this.presupuesto - gastado;
    }

}

//clase user interface

class UI {
    insertarPresupuesto(cantidad) {
        const { presupuesto, restante } = cantidad;
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(mensaje, tipo){
        //crear un div
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('tex-center', 'alert');

        if (tipo === 'error'){
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success')
        }

        divMensaje.textContent = mensaje;

        document.querySelector('.primario').insertBefore( divMensaje, formulario);

        setTimeout(() => {
            divMensaje.remove();
        }, 3000);
    }

    agregarGastoListado(gastos) {
        
        this.limpiarHTML();

        //iterar los gastos
        gastos.forEach(gasto =>{
            
            const { cantidad, nombre, id} = gasto;

            //crear un li
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            nuevoGasto.dataset.id = id;

            //agregar el html del gasto

            nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill">S/ ${cantidad} </span>`;

            //boton para borrar el gasto

            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times;'
            nuevoGasto.appendChild(btnBorrar);

            //agregar al html
            gastoslistado.appendChild(nuevoGasto);
        })
    }

     // Comprueba el presupuesto restante
     actualizarRestante(restante) {
        document.querySelector('span#restante').textContent = restante; 
    }

     // Cambia de color el presupuesto restante
     comprobarPresupuesto(presupuestoObj) {
        const { presupuesto, restante} = presupuestoObj;
        const restanteDiv = document.querySelector('.restante');

        // Comprobar el 25% 
        if( (presupuesto / 4) > restante) {
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        } else if( (presupuesto / 2) > restante) {
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-warning');
        } else {
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }

        // Si presupuesta es igual a 0 
        if(restante <= 0 ) {
            ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        } 
    }

    limpiarHTML() {
        while(gastoslistado.firstChild) {
            gastoslistado.removeChild(gastoslistado.firstChild);
        }
    }

    mostrarButton() {
        button.disabled = false;
        button.style.opacity = "1";
        button.style.cursor = "pointer";
    }

    presupuestoAgotado(mensaje) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: mensaje,
        })
    }

}

//instanciar
const ui = new UI();
let presupuesto;

// funciones
function preguntarPresupuesto() {

    Swal.fire({
        title: 'Ingresa tu presupuesto',
        input: 'text',
        inputPlaceholder: '500',
    });

    const budgetContainer = document.querySelector('.swal2-container');
    const budgetInput = document.querySelector('.swal2-input');

    budgetContainer.addEventListener('click', (e) => {
        const budgetValue = Number(budgetInput.value);

        if (e.target.classList.contains('swal2-container') || e.target.classList.contains('swal2-confirm')) {
            if (budgetValue === '' || budgetValue <= 0 || isNaN(budgetValue)) {
                window.location.reload();
            } else {

                ui.limpiarHTML();

                presupuesto = new Presupuesto(budgetValue);

                ui.mostrarButton();

                ui.insertarPresupuesto(presupuesto);
            }
        }
        if (e.target.classList.contains('swal2-popup')) {
            return;
        }
    });

}

//añadir gastos
function agregarGasto(e) {
    e.preventDefault();

    const nombre = document.querySelector('#gasto').value;
    const cantidad =  Number(document.querySelector('#cantidad').value);

    //validacion
    if(nombre === '' || cantidad === '') {
        ui.imprimirAlerta('Debes llenar los dos campos', 'error');
        return;
    }else if (cantidad <=0 || isNaN(cantidad)){
        ui.imprimirAlerta('La cantidad no es valida', 'error');
        return;
    }else if (!isNaN(nombre)){
        ui.imprimirAlerta('El gasto no puede ser un numero', 'error');
        return;
    }
 
    //generar objeto con el gasto;
    const gasto = { nombre, cantidad, id: Date.now() }

    //añade un nuevo gasto
    presupuesto.nuevoGasto(gasto);

    //mensaje ok
    ui.imprimirAlerta('Gasto agregado correctamente');

    //imprimir los gastos
    const { gastos } = presupuesto;
    ui.agregarGastoListado(gastos);

    // Cambiar la clase que nos avisa si se va terminando
    ui.comprobarPresupuesto(presupuesto);

    // Actualiza el presupuesto restante
    const { restante } = presupuesto;

    // Actualizar cuanto nos queda
    ui.actualizarRestante(restante);

    //reinicia el formulario
    formulario.reset();
}

function eliminarGasto(e) {
    if(e.target.classList.contains('borrar-gasto')){
        const { id } = e.target.parentElement.dataset;
        presupuesto.eliminarGasto(id);
        // Reembolsar
        ui.comprobarPresupuesto(presupuesto);

        // Pasar la cantidad restante para actualizar el DOM
        const { restante } = presupuesto;
        ui.actualizarRestante(restante);

        // Eliminar del DOM
        e.target.parentElement.remove();
    } 
}

