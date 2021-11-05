const sqlLite3 = require('sqlite3').verbose();
const fs = require('fs');

if (!fs.existsSync('sqlite.log'))
	fs.writeFileSync('sqlite.log', '');

function SQLITE_LOG(query, data) {

	let timeStamp = new Date(Date.now()).toLocaleString();

	let log = `${timeStamp} - ${query} - ${JSON.stringify(data)}\n`;

	fs.appendFileSync('sqlite.log', log);

}

export default function Database(dbFile: any) {
	const db = new sqlLite3.Database(dbFile, (err) => {
		if (err) {
			console.error('Could not connect to database', err);
			return;
		}
	});
	return {
        promise: (sql: string, params: any[]) => {
            return new Promise((resolve, reject) => {
                // Most databases connection have an "all" method, but if yours don't, change it according to your database
				db.all(sql, params, (err, data) => {
					if (err) {
                        reject(err);
                    }
					else {
                        resolve(data);
                    }

				})
			});
        }
	}
}