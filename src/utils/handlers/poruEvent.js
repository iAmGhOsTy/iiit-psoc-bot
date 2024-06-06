const fs = require('fs');
const path = require('path'); 

module.exports = async (client) => {
   
    const poruEventsDir = path.join(__dirname, '../../poruEvents');

    
    fs.readdir(poruEventsDir, (err, files) => {
        if (err) client.logger.error(err);
        files.forEach(file => {
           
            const eventPath = path.join(poruEventsDir, file);

            const event = require(eventPath);
            
            let eventName = file.split(".")[0];
            
            client.poru.on(eventName, event.bind(null, client));
        });

        client.logger.loader(`${client.color.chalkcolor.red('[FINISH]')} ${files.length} music events loaded`)
    });
}
