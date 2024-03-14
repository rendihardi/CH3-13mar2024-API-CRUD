const fs = require("fs");
const express = require("express");
const app = express();
const PORT = 3000;

// Middleware untuk membaca json dari request body kita
app.use(express.json());

const customers = JSON.parse(fs.readFileSync(`${__dirname}/data/dummy.json`));
// Localhost
const defaultRoute = (req, res, next) => {
  res.send("<h1>Hallo FSW 1 <h1>");
};

const getCustomers = (req, res, next) => {
  res.status(200).json({
    status: "Success",
    totalData: customers.length,
    data: {
      customers,
    },
  });
};

const getCustomersId = (req, res, next) => {
  const id = req.params.id;
  // Array method untuk menemukan data
  const customer = customers.find((cust) => cust._id === id);

  if (!customer) {
    // Jika data tidak ditemukan, kirim respons dengan status 404 Not Found
    return res.status(404).json({
      status: "Not Found",
      message: `Customer with ID ${id} not found`,
    });
  }

  // Kirim respons dengan status 200 dan data customer jika ditemukan
  res.status(200).json({
    status: "Success",
    data: {
      customer,
    },
  });
};

// Api update data

const updateCustomers = (req, res) => {
  const id = req.params.id;
  // 1. melakukan pencarian data sesuai parameter id
  const customer = customers.find((cust) => cust._id === id);
  const customerIndex = customers.findIndex((cust) => cust._id === id);

  // 2. ada gak datanya
  if (!customer) {
    return res.status(404).json({
      status: "Not Found",
      message: `Customer with ${id} not found`,
    });
  }

  // 3. kalau ada , update datanya sesuai request user
  // object assign = menggabungkan objek OR spread operator

  customers[customerIndex] = { ...customers[customerIndex], ...req.body };

  // 4. melakukan update di dokumen jsonya
  fs.writeFile(
    `${__dirname}/data/dummy.json`,
    JSON.stringify(customers),
    (err) => {
      res.status(200).json({
        status: "OK",
        message: "berhasil update datanya",
        data: {
          customer: customer[customerIndex],
          customer,
        },
      });
    }
  );
};

// API menghapus data
const deleteCustomer = (req, res) => {
  const id = req.params.id;
  // 1. Melakukan pencarian data sesuai parameter id
  const customerIndex = customers.findIndex((cust) => cust._id === id);

  // 2. Cek apakah data ditemukan
  if (customerIndex === -1) {
    return res.status(404).json({
      status: "Not Found",
      message: `Customer with ${id} not found`,
    });
  }

  // 3. Jika ada, hapus data pelanggan dari array
  customers.splice(customerIndex, 1);

  // 4. Melakukan Delete di file JSON
  fs.writeFile(
    `${__dirname}/data/dummy.json`,
    JSON.stringify(customers),
    (err) => {
      if (err) {
        return res.status(500).json({
          status: "Error",
          message: "Failed to delete data",
        });
      }
      res.status(200).json({
        status: "OK",
        message: "Data deleted successfully",
      });
    }
  );
};

// API creat data
const createCustomer = (req, res) => {
  console.log(req.body);
  const newCustomers = req.body;
  customers.push(newCustomers);
  fs.writeFile(
    `${__dirname}/data/customers`,
    JSON.stringify(customers),
    (err) => {
      res.status(201).json({
        status: "Success",
        data: { customers: newCustomers },
      });
    }
  );
  res.send("Udah Cuy");
};

app.get("/api/v1/customers", getCustomers);
app.get("/api/v1/customers/:id", getCustomersId);
app.delete("/api/v1/customers/:id", deleteCustomer);
app.patch("/api/v1/customers/:id", updateCustomers);
app.post("/api/v1/customers", createCustomer);

app.get("/", defaultRoute);
app.route("/api/v1/customers").get(getCustomers).post(createCustomer);
app
  .route("/api/v1/customers/:id")
  .get(getCustomersId)
  .patch(updateCustomers)
  .delete(deleteCustomer);

app.listen(PORT, () => {
  console.log(`App Running on port : ${PORT}`);
});
