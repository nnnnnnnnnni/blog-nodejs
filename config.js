module.exports = {
	port: 3000,
	session: true,
	sessionTimeout: 30 * 24 * 60 * 60 * 1000,
	timeoue: 5000,
	mongodb: {
		url: 'mongodb://127.0.0.1:27017/blog'
	}
}