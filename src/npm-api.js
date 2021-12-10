'use strict'

import profile from 'npm-profile'
import PackageManager from "./PackageManager.js";

class NpmHandler {
    constructor(token) {
        this.token = token;
        this.opts = { '//registry.npmjs.org/:_authToken': this.token }
    }

    _isReadOnly(token) {
        return token.readonly
    }
    async verifyToken() {
        let success = false
        try {
            const tokens = await profile.listTokens(this.opts)
            // loop through tokens
            for (const index in tokens) {
                if (Object.prototype.hasOwnProperty.call(tokens, index)) {
                    if (success) break

                    const { token } = tokens[index]
                    if (this.token.startsWith(token)) {
                        success = !this._isReadOnly(token)
                    }
                }
            }

            return {success}
        } catch (e) {
            return { error: !!e }
        }
    }

    async getProfile() {
        return await profile.get(this.opts)
    }

    createPackage(data) {
        data.token = this.token
        this.pm = new PackageManager(data)
        return this.pm.impersonatePackage()
    }
}

export default NpmHandler
