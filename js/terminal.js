var util = util || {};
util.toArray = function (list) {
    return Array.prototype.slice.call(list || [], 0);
};

var Terminal =
    Terminal ||
    function (cmdContainer, cmdLineContainer, outputContainer) {
        const lib_ = {
            cmds: {
                cd: {
                    cb: function (e, args) {
                        if (lib_.bin.dir.includes(args[0])) {
                            window.open(`${args[0]}`, "_self");
                            e.value = "";
                            // return [``];
                        } else {
                            return [`directory ${args[0]} not found`];
                        }
                    },
                },
                wtf: {
                    cb: function (e, args) {
                        return ["wtf?"];
                    },
                },
                ls: {
                    cb: function (e, args) {
                        return lib_.bin.dir;
                    },
                },
                pwd: {
                    cb: function (e, args) {
                        return [`.${window.location.pathname}`];
                    },
                    help: "pwd -------------- echo current directory.",
                },
                clear: {
                    cb: function (e, args) {
                        if (args[0] == "history") {
                            window.localStorage.removeItem("history_");
                            history_ = [];
                            return ["the command history has been cleared."];
                        }

                        output_.innerHTML = "";
                        e.value = "";
                        return [];
                    },
                    help: "clear (history) -- clear log.",
                },
                date: {
                    cb: function (e, args) {
                        return [new Date()];
                    },
                    help: "date ------------- echo current local date.",
                },
                echo: {
                    cb: function (e, args) {
                        return [`${args.join(" ")}`];
                    },
                    help: "echo [value] ----- echo value passed as argument.",
                },
                uname: {
                    cb: function (e, args) {
                        return [navigator.appVersion];
                    },
                    help: "uname ------------ echo info about the server.",
                },
                whoami: {
                    cb: function (e, args) {
                        return [
                            "<b class='whoami-text'> my name is cristian macedo, i am a web developer located in brazil, computer science enthusiast, hooked to clean and well documented code, and i create beautiful websites :) </b>",
                        ];
                    },
                    help: "whoami ----------- echo info about cristian macedo.",
                },
                darknight: {
                    cb: function (e, args) {
                        document
                            .getElementsByTagName("head")[0]
                            .insertAdjacentHTML(
                                "beforeend",
                                '<link rel="stylesheet" type="text/css" href="./css/darknight.css">'
                            );
                        // var script = document.createElement("script");
                        // script.type = "text/javascript";
                        // script.src = "./js/darknight.js";
                        // document
                        //     .getElementsByTagName("head")[0]
                        //     .appendChild(script);
                        return ["get out"];
                    },
                },
                help: {
                    cb: function (e, args) {
                        return args[0]
                            ? [lib_.cmds[args[0]].help]
                            : Object.values(lib_.cmds).map((cmd) => cmd.help);
                    },
                    help:
                        "help [command] --- echo help about the specified command.",
                },
            },
            bin: {
                dir: ["#skills", "#projects", "#jobs", "#contact"],
            },
        };

        var cmdContainer_ = document.querySelector(cmdContainer);
        var cmdLine_ = document.querySelector(cmdLineContainer);
        var output_ = document.querySelector(outputContainer);
        var cmdLineSelector_ = cmdLineContainer;
        var outputSelector_ = outputContainer;

        var fs_ = null;
        var cwd_ = null;
        var history_ =
            JSON.parse(window.localStorage.getItem("history_")) || [];
        var histpos_ = 0;
        var histtemp_ = 0;
        var outputId_ = 0;

        window.URL = window.URL || window.webkitURL;
        window.requestFileSystem =
            window.requestFileSystem || window.webkitRequestFileSystem;

        cmdContainer_.addEventListener(
            "click",
            function (e) {
                cmdLine_.focus();
            },
            false
        );

        cmdLine_.addEventListener("click", inputTextClick_, false);
        cmdLine_.addEventListener("keydown", historyHandler_, false);
        cmdLine_.addEventListener("keydown", processNewCommand_, false);
        cmdLine_.addEventListener("keydown", cdAutoComplete_, false);

        function validateArgs_(args) {
            return (
                args.join("").search(/<(|\/|[^\/>][^>]+|\/[^>][^>]+)>/gim) == -1
            );
        }

        //
        function inputTextClick_(e) {
            this.value = this.value;
        }

        //
        function cdAutoComplete_(e) {
            if (e.keyCode == 9) {
                const input = cmdLine_.value.split(" ");
                if (input[0] == "cd" && input[1]) {
                    const found = lib_.bin.dir.filter((dir) =>
                        dir.startsWith(input[1])
                    );
                    if (found.length == 1) {
                        cmdLine_.value = `${input[0]} ${found[0]}`;
                    }
                }
            }
        }

        //
        function historyHandler_(e) {
            if (history_.length) {
                if (e.keyCode == 38 || e.keyCode == 40) {
                    if (history_[histpos_]) {
                        history_[histpos_] = this.value;
                    } else {
                        histtemp_ = this.value;
                    }
                }

                if (e.keyCode == 38) {
                    // up
                    histpos_--;
                    if (histpos_ < 0) {
                        histpos_ = 0;
                    }
                } else if (e.keyCode == 40) {
                    // down
                    histpos_++;
                    if (histpos_ > history_.length) {
                        histpos_ = history_.length;
                    }
                }

                if (e.keyCode == 38 || e.keyCode == 40) {
                    this.value = history_[histpos_]
                        ? history_[histpos_]
                        : histtemp_;
                    this.value = this.value; // Sets cursor to end of input.
                }
            }
        }

        //
        function processNewCommand_(e) {
            if (e.keyCode == 9) {
                // tab
                e.preventDefault();
                // Implement tab suggest.
            } else if (e.keyCode == 13) {
                // enter
                // Save shell history.
                if (this.value) {
                    history_[history_.length] = this.value;
                    histpos_ = history_.length;
                    window.localStorage.setItem(
                        "history_",
                        JSON.stringify(history_)
                    );
                }

                // Duplicate current input and append to output section.
                var line = this.parentNode.parentNode.cloneNode(true);
                line.removeAttribute("id");
                line.classList.add("line");
                var input = line.querySelector(cmdLineSelector_);
                input.autofocus = false;
                input.readOnly = true;
                output_.innerHTML = ``;
                output_.appendChild(line);

                if (this.value && this.value.trim()) {
                    var args = this.value.split(" ").filter(function (val, i) {
                        return val;
                    });
                    var cmd = args[0].toLowerCase();
                    args = args.splice(1); // Remove cmd from arg list.
                }

                if (validateArgs_(args)) {
                    if (lib_.cmds.hasOwnProperty(cmd)) {
                        const response = lib_.cmds[cmd].cb(this, args);
                        if (response) {
                            for (const msg of response) {
                                if (msg) output(msg);
                            }
                        }
                    } else {
                        output(cmd + ": command not found");
                    }
                } else {
                    output(["trying to xss me huh?... muahahaha"]);
                }

                if (cmd !== "cd")
                    cmdContainer_.scrollTo(0, cmdContainer_.scrollHeight);
                this.value = ""; // Clear/setup line for next input.
            }
        }

        //
        function formatColumns_(entries) {
            var maxName = entries[0].name;
            util.toArray(entries).forEach(function (entry, i) {
                if (entry.name.length > maxName.length) {
                    maxName = entry.name;
                }
            });

            var height =
                entries.length <= 3
                    ? "height: " + entries.length * 15 + "px;"
                    : "";

            // 12px monospace font yields ~7px screen width.
            var colWidth = maxName.length * 7;

            return [
                '<div class="ls-files" style="-webkit-column-width:',
                colWidth,
                "px;",
                height,
                '">',
            ];
        }

        //
        async function output(html) {
            output_.insertAdjacentHTML("beforeEnd", `<p>${html}</p>`);
            // output_.insertAdjacentHTML('beforeEnd', `<p id="typewriter-${outputId_}" ></p>`);
            // type(html, document.querySelector(`#typewriter-${outputId_}`), 15, 20)
            outputId_ += 1;
        }

        // Cross-browser impl to get document's height.
        function getDocHeight_() {
            var d = document;
            return Math.max(
                Math.max(d.body.scrollHeight, d.documentElement.scrollHeight),
                Math.max(d.body.offsetHeight, d.documentElement.offsetHeight),
                Math.max(d.body.clientHeight, d.documentElement.clientHeight)
            );
        }

        //
        return {
            init: function () {
                // output(`<span id="sys-info">MacrisOS - (Version 29.12.1999)<br>${new Date()}</span>`);
            },
            output: output,
        };
    };
