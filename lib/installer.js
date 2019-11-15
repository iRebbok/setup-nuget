"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const tc = __importStar(require("@actions/tool-cache"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pick_version_1 = __importDefault(require("./pick-version"));
function install(spec = 'latest') {
    return __awaiter(this, void 0, void 0, function* () {
        const tool = yield pick_version_1.default(spec);
        core.debug(`Found NuGet version: ${tool.version}`);
        let cachePath = yield tc.find('nuget.exe', tool.version);
        if (!cachePath) {
            const nugetExePath = yield tc.downloadTool(tool.url);
            cachePath = yield tc.cacheFile(nugetExePath, 'nuget.exe', 'nuget.exe', tool.version);
        }
        core.debug(`nuget.exe cache path: ${cachePath}.`);
        core.exportVariable('NUGET', `${cachePath}/nuget.exe`);
        if (process.platform !== 'win32') {
            core.debug(`Creating dummy 'nuget' script.`);
            const scriptPath = path.join(cachePath, 'nuget');
            fs.writeFileSync(scriptPath, `#!/bin/sh\nmono ${path.join(cachePath, 'nuget.exe')} $@`);
            fs.chmodSync(scriptPath, '755');
        }
        core.addPath(cachePath);
    });
}
exports.default = install;