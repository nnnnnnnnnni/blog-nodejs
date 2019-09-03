const cfg = require('./config');
const databaseUrl = cfg.mongodb.url;
const mongoose = require('mongoose');

mongoose.connect(databaseUrl)
let db = mongoose.connection
let Schema = mongoose.Schema


let articleSchema = new Schema({
	title:       String,
	status:      String,
	create_time: String,
	update_time: String,
	tags:        Array,
	categories:  String,
	text:        String, 
	userId:      String,
	username:    String,
})
let Article = db.model('article', articleSchema)

let userSchema = new Schema({
	mobile:     String,
	mail:       String,
	password:   String,
	tags:       String,
	name:       String,
	categories: String,
	permission: Array,
	articleNum: {
		type: Number,
		default: 0
	}
})

let User = db.model('user',userSchema, 'user')

module.exports = {
	Article: Article,
	User: User
}