'use strict'

import profile from 'npm-profile'

class NpmHandler {
    constructor(token) {
        this.token = token;
        this.opts = { '//registry.npmjs.org/:_authToken': this.token }
    }

    isReadOnly(token) {
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
                        success = !this.isReadOnly(token)
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
}

export default NpmHandler
