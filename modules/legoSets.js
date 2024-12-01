
require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');
const setData = require("../data/setData");
const themeData = require("../data/themeData");


class LegoData {
    sequelize;
    Set;
    Theme;
    constructor() {
        this.sequelize = new Sequelize('seneca_webdb', 'seneca_webdb_owner', 'seLC7IWub9py', {
            host: 'ep-late-wave-a5k28qh2-pooler.us-east-2.aws.neon.tech',
            dialect: 'postgres',
            port: 5432,
            dialectOptions: {
                ssl: { rejectUnauthorized: false },
            },
        });
        
        // Define the Theme model
        this.Theme = this.sequelize.define('Theme', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: Sequelize.STRING,
            },
        }, {
            createdAt: false, 
            updatedAt: false,
        });

        // Define the Set model
        this.Set = this.sequelize.define('Set', {
            set_num: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            name: Sequelize.STRING,
            year: Sequelize.INTEGER,
            num_parts: {
                type: Sequelize.INTEGER,
            },
            theme_id: {
                type: Sequelize.INTEGER,
            },
            img_url: {
                type: Sequelize.STRING,
            },
        }, {
            createdAt: false, 
            updatedAt: false,
        });

        //  Relation between Set and Theme
        this.Set.belongsTo(this.Theme, {foreignKey: 'theme_id'});
    }
    // -------------------------------------------------------------------
    initialize() {
        return new Promise((resolve, reject) => {
            this.sequelize.sync().then(() => {
                resolve()
            }).catch(err => 
                reject(err)
            )
        });
    }
    getAllSets() {
        return new Promise((resolve, reject) => {
            this.Set.findAll({ include: [this.Theme] }) 
                .then((sets) => {
                    resolve(sets); // Return all sets
                })
                .catch((err) => reject(`Error fetching all sets: ${err}`));
        });
    }
    getAllThemes() {
        return new Promise((resolve, reject) => {
            this.Theme.findAll()
                .then((themes) => resolve(themes)) // Return all themes
                .catch((err) => reject(`Error fetching themes: ${err}`));
        });
    }
    getSetByNum(setNum) {
        return new Promise((resolve, reject) => {
            this.Set.findAll({ 
                where: { set_num: setNum }, 
                include: [this.Theme] 
            })
                .then((sets) => {
                    if (sets.length > 0) {
                        resolve(sets[0]); // Return the first set found
                    } else {
                        reject(`Unable to find requested set with set number: ${setNum}`);
                    }
                })
                .catch((err) => reject(`Error fetching set by number: ${err}`));
        });
    }
    getSetsByTheme(theme) {
        return new Promise((resolve, reject) => {
            this.Set.findAll({
                include: [this.Theme],where: { 
                    '$Theme.name$': { 
                        [Sequelize.Op.iLike]: `%${theme}%` 
                    } 
                }
            })
                .then((sets) => {
                    if (sets.length > 0) {
                        resolve(sets); //  match sets
                    } else {
                        reject(`Unable to find sets by theme name: ${theme}`);
                    }
                })
                .catch((err) => reject(`Error fetching sets by theme: ${err}`));
        });
    }
    addSet(newSet) {
        return new Promise((resolve, reject) => {
            this.Set.create(newSet)
                .then(() => resolve()) // added the set
                .catch((err) => {
                    reject(err.errors[0].message); 
                });
        });
    }
    deleteSetByNum(setNum) {
        return new Promise((resolve, reject) => {
            this.Set.destroy({
                where: { set_num: setNum }
            })
            .then((rowsDeleted) => {
                if (rowsDeleted > 0) {
                    resolve(); // record deleted
                } else {
                    reject("No set Deleted.");
                }
            })
            .catch(err =>
                reject(err.errors ? err.errors[0].message : "There is an error to deleting the set."));
        });
    }
}
module.exports = LegoData;
