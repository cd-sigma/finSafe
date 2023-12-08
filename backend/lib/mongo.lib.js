const mongoose = require("mongoose")
const consoleLib = require("./console.lib")

async function db(url) {
    try {
        mongoose.set("strictQuery", false)
        mongoose.connect(url)
        const connection = mongoose.connection
        connection.once("open", () => {
            consoleLib.logInfo("MongoDB connected")
        })
    } catch (error) {
        throw error
    }
}

async function connect(url) {
    try {
        mongoose.set("strictQuery", false)
        mongoose.connect(url)
        //TODO listen all events here
        const connection = mongoose.connection
        connection.once("open", () => {
            consoleLib.logInfo("MongoDB connected")
        })
    } catch (error) {
        throw error
    }
}

function isConnected() {
    try {
        let isConnected = mongoose.connection.readyState === 1
        return isConnected
    } catch (error) {
        throw error
    }
}

async function getStats() {
    try {
        let dbs = await mongoose.connection.db.admin().listDatabases()
        dbs = dbs.databases.filter((db) => {
            return db.name !== "admin" && db.name !== "local" && db.name !== "config"
        })

        let dbStats = await Promise.all(dbs.map(async ({name}) => {
            const dbConnection = mongoose.connection.useDb(name)
            return dbConnection.db.stats()
        }),)

        return dbStats
    } catch (error) {
        throw error
    }
}

async function getCountForModel(model) {
    try {
        if (model == null) {
            throw "values of model " + model
        }
        let count = await model.count()
        return count
    } catch (err) {
        throw err
    }
}

async function getCountForModelWithQuery(model, query) {
    try {
        if (model == null || query == null) {
            throw "values of model " + model + " query " + query
        }
        let count = await model.countDocuments(query)
        return count
    } catch (err) {
        throw err
    }
}

async function disconnect() {
    try {
        await mongoose.disconnect()
        consoleLib.logInfo("MongoDB disconnected")
    } catch (err) {
        throw err
    }
}

async function findById(model, id) {
    try {
        if (id == null || model == null) {
            throw "values of id " + id + " model " + model
        }
        let doc = await model.findById(id)
        return doc
    } catch (error) {
        throw error
    }
}

async function findByQuery(model, query, option = {}) {
    try {
        if (query == null || model == null) {
            throw "values of query " + query + " model " + model
        }
        let docs = await model.find(query, option)
        return docs
    } catch (error) {
        throw error
    }
}

async function findOneByQuerywithOption(model, query, option = {}) {
    try {
        if (model == null || query == null) {
            throw "values of model " + model + " query " + query
        }
        let findOneObject = await model.findOne(query, option)
        return findOneObject
    } catch (err) {
        throw err
    }
}

async function findByQueryWithSkipLimit(model, query, limit, skip) {
    try {
        if (model == null || query == null || limit == null || skip == null) {
            throw "values of model" + model + " query " + query + " limit " + limit + " skip" + skip
        }
        let docs = await model.find(query).skip(skip).limit(limit)
        return docs
    } catch (err) {
        throw err
    }
}

async function findByQueryWithHint(model, query, hint) {
    try {
        if (query == null || model == null || hint == null) {
            throw "values of id " + " model " + model + " hint " + hint
        }
        let docs = await model.find(query).hint(hint)
        return docs
    } catch (error) {
        throw error
    }
}

async function findByQueryWithHintWithSelect(model, query, hint, selectedFields) {
    try {
        if (query == null || model == null || hint == null || selectedFields == null) {
            throw " model " + model + " hint " + hint + " selectedFields " + selectedFields
        }
        let docs = await model.find(query).hint(hint).select(selectedFields)
        return docs
    } catch (error) {
        throw error
    }
}

async function findByQueryWithHintWithSelectWithSkipLimit(model, query, hint, selectedFields, skip, limit,) {
    try {
        if (query == null || model == null || hint == null || selectedFields == null) {
            throw " model " + model + " hint " + hint + " selectedFields " + selectedFields
        }
        let docs = await model.find(query).hint(hint).skip(skip).limit(limit).select(selectedFields)
        return docs
    } catch (error) {
        throw error
    }
}

async function findOneByQueryWithHint(model, query, hint) {
    try {
        if (query == null || model == null || hint == null) {
            throw "values of query" + query + " model " + model + " hint " + hint
        }
        let doc = await model.findOne(query).hint(hint)
        return doc
    } catch (error) {
        throw error
    }
}

async function findByQueryWithSkipLimitWithHint(model, query, limit, skip, hint) {
    try {
        if (model == null || query == null || limit == null || skip == null || hint == null) {
            throw ("values of model " + model + " query " + query + " limit " + limit + " skip" + skip + " hint " + hint)
        }
        let docs = await model.find(query).skip(skip).limit(limit).hint(hint)
        return docs
    } catch (err) {
        throw err
    }
}

async function deleteMany(model, query) {
    try {
        if (model == null || query == null) {
            throw "values of model " + model + " query " + query
        }
        await model.deleteMany(query)
    } catch (err) {
        throw err
    }
}

async function deleteOne(model, query) {
    try {
        if (model == null || query == null) {
            throw "values of model " + model + " query " + query
        }
        const deletedData = await model.deleteOne(query)
        return deletedData
    } catch (err) {
        throw err
    }
}

async function findOneAndUpdate(model, filterQuery, updateQuery, options = {}) {
    try {
        if (model == null || filterQuery == null || updateQuery == null) {
            throw ("values of model " + model + " filterQuery " + filterQuery + " updateQuery " + updateQuery)
        }
        let doc = await model.findOneAndUpdate(filterQuery, updateQuery, options)
        return doc
    } catch (error) {
        throw error
    }
}

async function bulkWrite(model, operations, options = {}) {
    try {
        if (model == null || operations == null) {
            throw "values of model " + model + " operations " + operations
        }
        let bulkwriteObject = await model.bulkWrite(operations, options)
        return bulkwriteObject
    } catch (err) {
        throw err
    }
}

async function findOneByQuery(model, query) {
    try {
        if (model == null || query == null) {
            throw "values of model " + model + " query " + query
        }
        let findOneObject = await model.findOne(query)
        return findOneObject
    } catch (err) {
        throw err
    }
}

async function createDoc(model, object) {
    try {
        if (model == null || object == null) {
            throw "values of model " + model + " object " + object
        }
        let doc = await model.create(object)
        return doc
    } catch (err) {
        throw err
    }
}

async function getDistinctValueForField(model, query, field) {
    try {
        if (model == null || query == null || field == null) {
            throw "values of model " + model + "query" + query + " field " + field
        }
        let distinctValues = await model.find(query).distinct(field)
        return distinctValues
    } catch (err) {
        throw err
    }
}

async function getDistinctCountForFieldWithQuery(model, query, field) {
    try {
        if (model == null || query == null || field == null) {
            throw "values of model " + model + "query" + query + " field " + field
        }
        let distinctCount = await model.find(query).distinct(field).count()
        return distinctCount
    } catch (err) {
        throw err
    }
}

async function isDocExistsForQuery(model, query) {
    try {
        if (model == null || query == null) {
            throw "values of model " + model + " query " + query
        }
        const exist = await model.exists(query)
        return exist
    } catch (err) {
        throw err
    }
}

async function findByQueryWithSortLimit(model, query, sort, limit) {
    try {
        if (model == null || query == null || sort == null || limit == null) {
            throw "values of model " + model + " query " + query + "sort" + sort + "limit " + limit
        }
        const docs = await model.find(query).sort(sort).limit(limit)
        return docs
    } catch (err) {
        throw err
    }
}

//query must be in array of object
async function aggregate(model, query) {
    try {
        if (model == null || query == null) {
            throw "values of model " + model + " query " + query
        }
        const docs = await model.aggregate(query).exec()
        return docs
    } catch (err) {
        throw err
    }
}

module.exports = {
    db: db,
    getStats: getStats,
    getCountForModel: getCountForModel,
    disconnect: disconnect,
    findById: findById,
    findByQuery: findByQuery,
    connect: connect,
    isConnected: isConnected,
    findOneByQuerywithOption: findOneByQuerywithOption,
    getCountForModelWithQuery: getCountForModelWithQuery,
    findByQueryWithSkipLimit: findByQueryWithSkipLimit,
    findByQueryWithSkipLimitWithHint: findByQueryWithSkipLimitWithHint,
    findByQueryWithHint: findByQueryWithHint,
    findByQueryWithHintWithSelect: findByQueryWithHintWithSelect,
    findByQueryWithHintWithSelectWithSkipLimit: findByQueryWithHintWithSelectWithSkipLimit,
    findOneByQueryWithHint: findOneByQueryWithHint,
    findOneAndUpdate: findOneAndUpdate,
    deleteMany: deleteMany,
    deleteOne: deleteOne,
    bulkWrite: bulkWrite,
    findOneByQuery: findOneByQuery,
    createDoc: createDoc,
    getDistinctValueForField: getDistinctValueForField,
    getDistinctCountForFieldWithQuery: getDistinctCountForFieldWithQuery,
    isDocExistsForQuery: isDocExistsForQuery,
    findByQueryWithSortLimit: findByQueryWithSortLimit,
    aggregate: aggregate,
}
