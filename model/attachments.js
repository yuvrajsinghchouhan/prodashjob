var CONFIG      = require('../config/config');

function get_attachment(path, name){
	return encodeURI(path.substring(2) + name);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports  = {
    "get_attachment"        :   get_attachment,
    "capitalizeFirstLetter" :   capitalizeFirstLetter
};
