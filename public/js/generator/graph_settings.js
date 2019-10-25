
const template = /*html*/
    `<div class="card text-center" id="graph_params">
        <div class="card-header">
            <ul class="nav nav-pills card-header-pills">
                <li class="nav-item" @click="setTab('settings')">
                    <a class="nav-link" :class='{ active : tabs.settings }' href="#">Settings</a>
                </li>
                <li class="nav-item" @click="setTab('editor')">
                    <a class="nav-link" :class='{ active : tabs.editor }' href="#">Editor</a>
                </li>
            </ul>
        </div>
        <div class="card-body" v-show="tabs.settings">
            <p class="card-title">Choose fields to render and other options</p> 
            <div class='row justify-content-center'>
                <div class='col-6'>
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="basic-addon1">Field 1</span>
                        </div>
                        <select class="form-control" aria-label="" id="field1" aria-describedby="basic-addon1">
                            <option v-for='field in jsonFields'> {{ field }} </option>
                        </select>
                    </div>
                </div>
            </div>
            <div class='row justify-content-center'>
                <div class='col-6'>
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="basic-addon1">Field 2</span>
                        </div>
                        <select class="form-control" aria-label="" id="field2" aria-describedby="basic-addon1">
                            <option v-for='field in jsonFields'> {{ field }} </option>
                        </select>
                    </div>
                </div>          
            </div>
            <div class='row justify-content-center'>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" id="barplot" value="option1" name='chart-type' checked>
                    <label class="form-check-label" for="barplot">Bar Plot</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" id="bubble" value="option1" name='chart-type'>
                    <label class="form-check-label" for="bubble">Bubble Chart</label>
                </div>
            </div>
        </div>
        <div class="card-body" v-show='tabs.editor' >
            <div class='container'>
                <h5>Here you can Visualize or edit your Data</h5> 
                <div class='row'>
                    <div class='col-sm-12' id='cont'>
                        <div id='code' class='inner jumbotron'>{{ jsonString }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

const graphsettings = {

    name : 'graphsettings',

    props : { json : Object },

    data : function() {
        return {
            fields : [],
            tabs : {
                settings : true,
                editor : false
            }
        }
    },

    template : template,
      
    methods : {
        setTab : function(tabName) {
            const {tabs} = this;
            tabs[tabName] = true;
            tabName === 'settings'
                ? tabs.editor = false
                : tabs.settings = false;
        }
    },

    computed : {
        jsonString : function () { return (JSON.stringify(this.json, null, 4)) },
        jsonFields : function () { return Object.keys(this.json[0]) }
    },

    mounted : function() {
        const editor = ace.edit('code');
        editor.session.setMode('ace/mode/javascript');      
    }
};

export default graphsettings;
