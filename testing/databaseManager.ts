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
	var db = new sqlLite3.Database(dbFile, (err) => {
		if (err) {
			console.error('Could not connect to database', err);
			return;
		} else {
			console.log('\n\n------< Connected to Database >------\n\n');
		}
	});
	return {
		db: db,
		runSql: function (query: string, params?: Array<any>, callback?: Function): void {
			SQLITE_LOG(query, params);
			this.db.run(query, params, callback);
		},
		getSql: function (query: string, params?: Array<any>, callback?: Function): void {
			SQLITE_LOG(query, params);
			this.db.get(query, params, callback);
		},
		allSql: function (query: string, params?: Array<any>, callback?: Function): void {
			SQLITE_LOG(query, params);
			this.db.all(query, params, callback);
		},
		Select: function (query: string, params?: Array<any>, callback?: Function): void {
			SQLITE_LOG('SELECT ' + query, params);
			this.db.run('SELECT ' + query, params, callback);
		},
		promise: function (query: string, params?: Array<any> | any): Promise<any[]> {
			if (params && !Array.isArray(params)) {
				params = [params];
			}
			var db = this;
			return new Promise((resolve, reject) => {
				db.allSql(query, params, (err, data) => {

					if (err)
						reject(err);
					else
						resolve(data);

				})
			});
		}
	}
}