var sqlite3 = require('sqlite3').verbose();
var LTT = require('list-to-tree');

module.exports.resetUIDB = function (dbPath) {
    var db = new sqlite3.Database(dbPath);
    db.serialize(function () {
        db.run("DROP TABLE ui_tree", function (err) { });
        db.run("DROP TABLE ui_record", function (err) { });

        let createSQLs = [
            "CREATE TABLE IF NOT EXISTS query(id INTEGER PRIMARY KEY NOT NULL, query_sql TEXT NOT NULL, \
                param_count INTEGER NOT NULL)",

            "CREATE TABLE IF NOT EXISTS ui_detail_box (id INTEGER PRIMARY KEY NOT NULL)",

            "CREATE TABLE IF NOT EXISTS ui_attachment_box (id INTEGER PRIMARY KEY NOT NULL)",

            "CREATE TABLE IF NOT EXISTS ui_list (id INTEGER PRIMARY KEY NOT NULL, query_id INTEGER NOT NULL, \
                record_count_per_page INTEGER)",

            "CREATE TABLE IF NOT EXISTS ui_list_column (ui_list_id INTEGER NOT NULL, name_in_query TEXT NOT NULL,\
                 name_on_ui TEXT NOT NULL, width INTEGER, data_type INTEGER, is_default_order INTEGER)",

            "CREATE TABLE IF NOT EXISTS ui_tree (id INTEGER PRIMARY KEY NOT NULL, display_name NOT NULL, \
                parent_id INTEGER, depth INTEGER, record_id INTEGER, query_id INTEGER, param TEXT)",

            "CREATE TABLE IF NOT EXISTS ui_data_tbl (col1 TEXT, col2 TEXT)"];
        createSQLs.forEach(elecment => {
            db.run(elecment);
        });
        db.close();
    });
}

module.exports.convert5100DB2UIDB = function(dataDBPath, uiDBPath) {
    var dataDB = new sqlite3.Database(dataDBPath);

    var uiDB = new sqlite3.Database(uiDBPath);
    
    
    dataDB.each("SELECT * FROM ui_tree_home", function() {

    });
}

module.exports.insertUITreeSampleData = function (dbPath) {
    var db = new sqlite3.Database(dbPath);
    db.serialize(function () {
        db.run("DELETE FROM ui_tree", function (err) { });
        db.run("INSERT INTO ui_tree(id, name, parent_id, param) VALUES(1, 'root', 0, 'root')", function (err) { });
        db.run("INSERT INTO ui_tree(id, name, parent_id, param) VALUES(2, 'category', 1, 'category')", function (err) { });
        db.run("INSERT INTO ui_tree(id, name, parent_id, param) VALUES(3, 'country', 1, 'country')", function (err) { });
        db.run("INSERT INTO ui_tree(id, name, parent_id, param) VALUES(4, 'tag', 1, 'tag')", function (err) { });
        db.run("INSERT INTO ui_tree(id, name, parent_id, param) VALUES(5, 'movie', 2, 'movie')", function (err) { });
        db.run("INSERT INTO ui_tree(id, name, parent_id, param) VALUES(6, 'drama', 2, 'drama')", function (err) { });
        db.run("INSERT INTO ui_tree(id, name, parent_id, param) VALUES(7, 'documentary', 2, 'documentary')", function (err) { });
        db.run("INSERT INTO ui_tree(id, name, parent_id, param) VALUES(8, 'China', 3, 'China')", function (err) { });
        db.run("INSERT INTO ui_tree(id, name, parent_id, param) VALUES(9, 'America', 3, 'America')", function (err) { });
        db.run("INSERT INTO ui_tree(id, name, parent_id, param) VALUES(10, 'nice', 4, 'nice')", function (err) { });
        db.run("INSERT INTO ui_tree(id, name, parent_id, param) VALUES(11, 'dry', 4, 'dry')", function (err) { });

        db.run("DELETE FROM ui_record", function (err) { });
        db.run("INSERT INTO ui_record(id, title, country, category, introduction) VALUES(1, 'The Shawshank Redemption', 'America', 'movie', 'as become a classic film')", function (err) { });
        db.run("INSERT INTO ui_record(id, title, country, category, introduction) VALUES(2, 'The Godfather', 'America', 'movie', 'as become a classic film')", function (err) { });
        db.run("INSERT INTO ui_record(id, title, country, category, introduction) VALUES(3, 'The Godfather: Part II', 'America', 'movie', 'as become a classic film')", function (err) { });
        db.close();
    });
}

module.exports.loadUITree = function (dbPath, callback) {
    var db = new sqlite3.Database(dbPath);
    var treeNodes = [];
    db.serialize(function () {
        db.each("SELECT * FROM ui_tree",
            function (err, row) {
                treeNodes.push({ id: row.id, name: row.display_name, parent: row.parent_id, param: row.param });
            },
            function () {
                var ltt = new LTT(treeNodes, {
                    key_id: 'id',
                    key_parent: 'parent'
                });
                var tree = ltt.GetTree();
                db.close();
                callback(tree);
            }
        );
    });
}

module.exports.loadUIRecord = function (dbPath, column, param, callback) {
    var db = new sqlite3.Database(dbPath);
    var records = []
    db.serialize(function () {
        db.each("SELECT * FROM ui_record WHERE " + column + " = '" + param + "'",
            function (err, row) {
                records.push({ id: row.id, title: row.title, country: row.country, category: row.category, introduction: row.introduction });
            },
            function () {
                db.close();
                callback(records);
            }
        );
    });
}