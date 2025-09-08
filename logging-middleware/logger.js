const axios = require("axios");
require("dotenv").config();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const LOG_API_URL = process.env.LOG_API_URL || "http://20.244.56.144/evaluation-service/logs";

// Allowed values
const ALLOWED_STACKS = ["backend", "frontend"];
const ALLOWED_LEVELS = ["debug", "info", "warn", "error", "fatal"];

const ALLOWED_PACKAGES = {
    backend: ["cache", "controller", "cron_job", "db", "domain", "handler", "repository", "route", "service"],
    frontend: ["api", "component", "hook", "page", "state", "style"],
    common: ["auth", "config", "middleware", "utils"],
};

function validateLogPayload(payload) {
    if (!ALLOWED_STACKS.includes(payload.stack)) {
        console.error(`Invalid stack: ${payload.stack}`);
        return false;
    }
    if (!ALLOWED_LEVELS.includes(payload.level)) {
        console.error(`Invalid level: ${payload.level}`);
        return false;
    }
    const validPackages = [...ALLOWED_PACKAGES.common, ...ALLOWED_PACKAGES[payload.stack]];
    if (!validPackages.includes(payload.package)) {
        console.error(`Invalid package '${payload.package}' for stack '${payload.stack}'`);
        return false;
    }
    return true;
}

/**
 * Reusable logging function.
 * @param {string} stack   - "backend" | "frontend"
 * @param {string} level   - "debug" | "info" | "warn" | "error" | "fatal"
 * @param {string} pkg     - Package/module name
 * @param {string} message - Log message
 */
async function Log(stack, level, pkg, message) {
    if (!ACCESS_TOKEN) {
        console.error("Authorization token missing. Please set ACCESS_TOKEN in .env");
        return;
    }

    const payload = {
        stack: stack.toLowerCase(),
        level: level.toLowerCase(),
        package: pkg.toLowerCase(),
        message,
    };

    if (!validateLogPayload(payload)) return;

    try {
        const response = await axios.post(LOG_API_URL, payload, {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
        console.log("Log sent successfully:", response.data);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("Failed to send log:", error.response.data);
        } else {
            console.error("Unexpected log error:", error.message);
        }
        console.log("Local log (not sent):", payload);
    }
}

module.export = { Log }