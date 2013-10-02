var bz = require('bz');
var Terminal = require('blessings');
var term = new Terminal();

var bugzilla = bz.createClient();

var opts = {
    quicksearch: 'whiteboard:s=2013.backlog'
};

bugzilla.searchBugs(opts, function(error, bugs) {
    if (!error) {
        console.log(' ');
        bugs.forEach(function(b) {
            var out = tabular([{
                text: b.id,
                width: 6,
                align: 'center',
                fn: term.lightblue
            }, {
                text: b.priority,
                width: 2,
                fn: function(v) {
                    switch (v.trim()) {
                        case "P1":
                            return term.red(v);
                        case "P2":
                            return term.yellow(v);
                        case "P3":
                            return term.yellow(v);
                        case "--":
                            return '  ';
                    }
                    return v;
                }
            }, {
                text: b.summary,
                align: 'left',
                fn: term.white
            }, {
                text: b.whiteboard,
                align: 'right',
                width: 15
            }]);
            console.log(out);
        });
        console.log(' ');
    }
});

function tabular(cols, opts) {
    var wrapped = [];
    var maxLines = 1;
    var ret = [];
    opts = opts || {};
    var margin = opts.margin || 2;
    var totalMargin = margin * (cols.length + 1);
    var colsWidth = 0;
    var flexCols = 0;
    cols.forEach(function(c) {
        if (c.width) {
            colsWidth += c.width;
        } else {
            flexCols++;
        }
    });
    var flex = term.width - totalMargin - colsWidth;
    cols.forEach(function(col) {
        var wid = col.width || ~~(flex / flexCols);
        wrapped.push(wrap(col.text, wid));
        maxLines = Math.max(wrapped[wrapped.length - 1].length, maxLines);
    });
    for (var i = 0; i < maxLines; i++) {
        var line = rep(' ', margin);
        for (var j = 0; j < cols.length; j++) {
            var col = cols[j];
            var wid = col.width || ~~(flex / flexCols);
            var fn = col.fn || function(o) {
                    return o;
                };
            line += fn(pad(wrapped[j][i], wid, col.align));
            line += rep(' ', margin);
        }
        ret.push(line);
    }
    return ret.join('\n');
}

function rep(c, n) {
    return (new Array(n + 1)).join(c);
}

function pad(text, width, dir) {
    if (!text) text = '';
    var diff = width - text.length;
    if (diff < 0) {
        return text.substr(0, width);
    }
    if (dir === 'center') {
        return rep(' ', diff / 2 | 0) + text + rep(' ', diff - (diff / 2 | 0));
    }
    if (dir === 'right') {
        return rep(' ', diff) + text;
    }
    return text + rep(' ', diff);
}

function wrap(text, width) {
    text = text.toString();
    words = text.split(' ');
    var line = words.shift();;
    var lines = [];
    for (var i = 0; i < words.length; i++) {
        var w = words[i];
        if ((line + ' ' + w).length > width) {
            lines.push(line);
            if (w.length > width) {
                words.splice(i + 1, 0, w.substr(width - 1));
                w = w.substr(0, width - 1);
            }
            line = w;
        } else {
            line += ' ' + w;
        }
    }
    lines.push(line);
    return lines;
}