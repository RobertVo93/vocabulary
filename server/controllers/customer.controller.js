let customers = {
				customer1: {
					id: 1,
					firstname: "Joe",
					lastname: "Thomas",
					age: 36
				},
				customer2: {
					id: 2,
					firstname: "Peter",
					lastname: "Smith",
					age: 18
				},
				customer3: {
					id: 3,
					firstname: "Lauren",
					lastname: "Taylor",
					age: 31
				},
				customer4: {
					id: 4,
					firstname: "Mary",
					lastname: "Taylor",
					age: 24
				},
				customer5: {
					id: 5,
					firstname: "David",
					lastname: "Moore",
					age: 25
				},
				customer6: {
					id: 6,
					firstname: "Holly",
					lastname: "Davies",
					age: 27
				},
				customer7: {
					id: 7,
					firstname: "Michael",
					lastname: "Brown",
					age: 45
				}
			}
 
exports.create = function(req, res) {
	console.log('create new quote');
	// find the largest ID
	let arr = Object.keys( customers ).map(function ( key ) { return customers[key].id; });
	let newId = Math.max.apply( null, arr ) + 1;
	
	let newCustomer = req.body;
	newCustomer.id = newId;
    customers["customer" + newId] = newCustomer;
    res.json(newCustomer);
};
 
exports.findAll = function(req, res) {
	console.log('get all quotes')
    res.json(Object.values(customers));  
};
 
exports.findOne = function(req, res) {
    let customer = customers["customer" + req.params.id];
    res.json(customer);
};
 
exports.update = function(req, res) {
	let updatedCustomer = req.body; 
	customers["customer" + updatedCustomer.id] = updatedCustomer;
	res.json({msg: "Customer Updated Successfully!"});
};
 
exports.delete = function(req, res) {
    delete customers["customer" + req.params.id];
    res.json({msg: "Customer Deleted Successfully!"});
};