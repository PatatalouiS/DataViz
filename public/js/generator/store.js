
class Store {

    constructor () {
        this.state = {
            data : null,
            settingsView : 'settings'
        }
    }

    setData = newData => this.state.data = newData;

};


const s = new Store(); 


export default s;
