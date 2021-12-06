var sqlite3 = require('sqlite3').verbose();
var LTT = require('list-to-tree');


module.exports.resetUIDB = function (dbPath) {
}

function buildTreeData(curNode, data) {
    data.child.forEach(row => {
        var subNode = { 
            id: row.tree_node_id,
            display_name: row.display_name, 
            parent_id: row.parent_id, 
            depth : row.depth,
            base_sql : row.base_sql,
            count_sql : row.count_sql,
            query_condition : row.query_condition,
            query_id : row.query_id, 
            record_id : row.record_id,
            children: []
         }
        if (row.child) {
            buildTreeData(subNode, row);
        }
        curNode.children.push(subNode)
    });
}

module.exports.loadUITree = function (dbPath, callback) {
    var db = new sqlite3.Database(dbPath);
    var treeNodes = [];
    db.serialize(function () {
        var sql = "SELECT ui_tree.id AS id, ui_tree.display_name AS display_name,\
        parent_id, depth, ui_tree.record_id as record_id, ui_tree.query_id as query_id,\
        base_sql, count_sql, ui_tree.query_condition AS query_condition FROM ui_tree\
        left join record_query on ui_tree.query_id = record_query.id \
        left join ui_list on ui_tree.record_id = ui_list.id"
        db.each(sql,
            function (err, row) {
                treeNodes.push({ 
                    id: row.id,
                    display_name: row.display_name, 
                    parent_id: row.parent_id, 
                    depth : row.depth,
                    base_sql : row.base_sql,
                    count_sql : row.count_sql,
                    query_condition : row.query_condition,
                    query_id : row.query_id, 
                    record_id : row.record_id
                });
            },
            function () {
                db.close();
                var ltt = new LTT(treeNodes, {
                    key_id: 'id',
                    key_parent: 'parent_id'
                });
                var tree = ltt.GetTree();
                var root = {
                    display_name: tree[0].display_name,
                    children: []
                };
                buildTreeData(root, tree[0]);

                callback(root);
            }
        );
    });
}


module.exports.loadUIRecord = function (dbPath, sql, callback) {
    var db = new sqlite3.Database(dbPath);
    var records = []
    db.serialize(function () {
        db.each(sql,
            function (err, row) {
                record_item = {};
                for(var key in row) {
                    record_item[key] = row[key];
                }
                records.push(record_item);
            },
            function () {
                db.close();
                callback(records);
            }
        );
    });
}

module.exports.loadListRecordDefines = function(dbPath, records, callback) {
    var db = new sqlite3.Database(dbPath);
    db.serialize(function () {
        db.each("SELECT ui_list_id, display_name, display_name_en, query_name, width FROM ui_list_column",
            function (err, row) {
                records[row.ui_list_id].push({
                    display_name: row.display_name,
                    display_name_en : row.display_name_en,
                    query_name : row.query_name, 
                    width : row.width
                });
            },
            function () {
                db.close();
                callback();
            }
        );
    });
}