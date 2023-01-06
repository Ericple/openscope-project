import * as shell from "shelljs";

shell.cp("-R","src/pages/assets","dist/pages");
shell.cp("-R","src/pages/css","dist/pages");
shell.cp("-R","src/pages/html","dist/pages");
shell.cp("-R","src/pages/script","dist/pages");
shell.cp("-R","src/config","dist");