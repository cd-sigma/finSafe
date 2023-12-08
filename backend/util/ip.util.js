/*
    @author: ciphernova
    @date: 2023/07/30
    @description: This file contains functions to get the IP address of the server.
 */
const _=require("lodash")

const axios = require("axios")
const serverConfig = require("../config/server.config.json")

async function getIPAddress() {
    return new Promise(async (resolve, reject) => {
        try {
            let resp = await axios.get("https://jsonip.com/")
            if (resp.data && resp.data.ip) {
                resolve(resp.data.ip)
            }
        } catch (e) {
            reject(e)
        }
    })
}

async function getServerName() {
    return new Promise(async (resolve, reject) => {
        try {
            let ip = await getIPAddress()
            let serverName = ""
            for (let server of Object.keys(serverConfig)) {
                if (serverConfig[server].ip === ip) {
                    serverName = serverConfig[server].name
                    break
                }
            }

            if (!serverName) {
                serverName = "Unknown Server"
            }

            resolve(serverName)
        } catch (e) {
            reject(e)
        }
    })
}

async function getIpAddressForServerName(serverName) {
    return new Promise((resolve, reject) => {
        try {
            if (_.isEmpty(serverName)) {
                throw new Error("Server name is required")
            }

            let ip = ""
            for (let server of Object.keys(serverConfig)) {
                if (serverConfig[server].name === serverName) {
                    ip = serverConfig[server].ip
                    break
                }
            }

            resolve(_.isEmpty(ip) ? "Unknown IP" : ip)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    getIPAddress: getIPAddress,
    getServerName: getServerName,
    getIpAddressForServerName: getIpAddressForServerName,
}
