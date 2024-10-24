const sql = require("mssql");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// Traer todos los personajes
const getCharacters = async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query("SELECT * FROM Characters");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Traer un personaje por ID
const getCharacterById = async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("characterId", sql.Int, req.params.id)
      .query("SELECT * FROM characters WHERE characterId = @characterId");

    if (result.recordset.length === 0) {
      return res.status(404).send("No se encontró el personaje con ese ID");
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Crear un personaje
const createCharacter = async (req, res) => {
  try {
    const { name, house, wand, birthDate } = req.body;

    const characterId = req.id;

    let img = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "/characters",
      });
      img = uploadResult.secure_url;

      fs.unlinkSync(req.file.path);
    }

    const pool = await sql.connect();

    await pool
      .request()
      .input("characterId", sql.Int, characterId)
      .input("name", sql.NVarChar, name)
      .input("house", sql.NVarChar, house)
      .input("wand", sql.NVarChar, wand)
      .input("birthDate", sql.Date, birthDate)
      .input("img", sql.NVarChar, img)
      .query(
        "INSERT INTO characters (name, house, wand, birthDate, img) VALUES( @name, @house, @wand, @birthDate, @img)"
      );
    res.status(201).send("Se agrego exitosamente");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//actualizar un personaje
const updateCharacters = async (req, res) => {
  try {
    const characterId = req.params.id;
    const pool = await sql.connect();

    const result = await pool
      .request()
      .input("characterId", sql.Int, characterId)
      .query("SELECT * FROM characters WHERE characterId = @characterId");

    if (result.recordset.length === 0) {
      return res.status(400).send("No se encontró ningún personaje con ese ID");
    } else {
      const { name, house, wand, birthDate } = req.body;
      let img = result.recordset[0].img; 
      let updateFields = [];
      
      // Manejar la subida de la nueva imagen si se proporciona
      if (req.file) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "/characters",
        });
        img = uploadResult.secure_url;

        // Eliminar el archivo temporal después de la subida
        fs.unlinkSync(req.file.path);
      }

      if (name !== undefined) {
        updateFields.push("name = @name");
      }
      if (house !== undefined) {
        updateFields.push("house = @house");
      }
      if (wand !== undefined) {
        updateFields.push("wand = @wand");
      }
      if (birthDate !== undefined) {
        updateFields.push("birthDate = @birthDate");
      }
      if (img !== undefined) {
        updateFields.push("img = @img");
      }

      if (updateFields.length === 0) {
        return res.status(400).send("No se proporcionaron datos para actualizar");
      }

      const updateQuery = `UPDATE characters SET ${updateFields.join(
        ", "
      )} WHERE characterId = @characterId`;

      const request = pool.request();
      request.input("characterId", sql.Int, characterId);

      if (name !== undefined) request.input("name", sql.NVarChar, name);
      if (house !== undefined) request.input("house", sql.NVarChar, house);
      if (wand !== undefined) request.input("wand", sql.NVarChar, wand);
      if (birthDate !== undefined) request.input("birthDate", sql.Date, birthDate);
      if (img !== undefined) request.input("img", sql.NVarChar, img); 

      await request.query(updateQuery);

      res.status(200).send("Se actualizó el personaje exitosamente");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//eliminar personajes
const deleteCharacters = async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
    .input("characterId", sql.Int, req.params.id)
    .query('SELECT * FROM characters WHERE characterId = @characterId');

    if(result.recordset.length == 0){
      return res.status(404).send('No se encontro la publicación');
    }else{
      await pool.request()
      .input("characterId", sql.Int, req.params.id)
      .query('DELETE characters WHERE characterId= @characterId');

      res.status(200).send('La publicación se elimino con éxito');
    }

  } catch (err) {
    res.status(500).send(err.message);
  }
};


module.exports = {
  getCharacters,
  getCharacterById,
  createCharacter,
  updateCharacters,
  deleteCharacters
};
