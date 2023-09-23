const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../backend/models/Note");
const { body, validationResult } = require("express-validator");

// ROUTE 1: get all the notes using: POST "/api/notes/fetchallnotes". login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error");
        res.status(500).send("");
    }
});

// ROUTE 2: Add a new note using Post "/api/notes/addnote". login required
router.post(
    '/addnote',
    fetchuser,
    [
        body("title", "Enter a valid title").isLength({ min: 3 }),
        body("description", "Description must be at least 3 digits").isLength({
            min: 5,
        }),
    ],
    async (req, res) => {
        try {
            const { title, description, tag } = req.body;
            //if there are errors return bad request and the errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const note = new Note({
                title,
                description,
                tag,
                user: req.user.id,
            });
            const savedNote = await note.save();
            res.send(savedNote);
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Internal server error");
        }
    }
);

// ROUTE 3: Update an existing Note using: PUT "/api/notes/updatenote". login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        //create a newNote object
        const newNote={};
        if(title){newNote.title = title}
        if(description){newNote.description = description}
        if(tag){newNote.tag = tag}

        //find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if(!note){res.status(404).send('NOT FOUND')}
         if(note.user.toString()!==req.user.id){
            res.status(401).send("Not Allowed");
         }
        console.log(note)
        note = await Note.findByIdAndUpdate(req.params.id,{$set: newNote},{new:true});
        res.json(note)
        

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error");
    }
});

// ROUTE 4: Delete3 an existing Note using: DELETE "/api/notes/deletenote". login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
    try {
        //find the note to be deleted and update it
        let note = await Note.findById(req.params.id);
        if(!note){res.status(404).send('NOT FOUND')}
        //Allow deleting only if user owns this note
        if(note.user.toString()!==req.user.id){
            res.status(401).send("Not Allowed");
        }
        note = await Note.findByIdAndDelete(req.params.id);
        res.json({success:"Note has been deleted",note:note})

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;
