
import {getHOST} from '../utils.js';


const init = (VueInstance) => {
    Dropzone.options.drop = {
        paramName: "json_file",
        maxFilesize: 10,
        accept: (file, done) => done(),
        acceptedFiles : 'application/json',
        url: `http://${getHOST()}/generator`,
        dictDefaultMessage : 'Drag your .json file here',
        previewTemplate : /* html*/
            `<div class="dz-preview dz-file-preview">
                <div class="dz-details">
                    <div class="dz-filename"><span data-dz-name></span></div>
                    <div class="dz-size" data-dz-size></div>
                    <img data-dz-thumbnail />
                </div>
                <div class="dz-error-message"><span data-dz-errormessage></span></div>
            </div>`,
        
        init : () => {
            const drop = Dropzone.options.drop;
        },

        success : (file, response) => {
            VueInstance.$emit('charged', JSON.parse(response));
        }
    }
};

const dragarea = {

    created : function () {
        init(this);
    },

    template :   /*html*/
        `<div class='border rounded container text-center background-trans' id='drag_zone'>
            <form class="dropzone" id="drop" method='post' enctype='multipart/form-data'>
                <input type="file" name="json_file" style='display : none' />
                <img src="/static/img/drag_and_drop.png" alt="Drag and drop Icon" class='img-fluid'>
            </form>
        </div>`,
};

export default dragarea;