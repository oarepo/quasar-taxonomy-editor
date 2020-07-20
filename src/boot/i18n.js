import Vue from 'vue'
import VueI18n from 'vue-i18n'

import messages from 'src/i18n'

Vue.use(VueI18n)

const i18n = new VueI18n({
    locale: 'en-us',
    fallbackLocale: 'en-us',
    messages,
    pluralizationRules: {
        'cs-cz': function (choice, choicesLength) {
            if (choice === 0) {
                return 0
            }
            if (choice === 1) {
                return 1
            }
            if (choice <= 5) {
                return 2
            }
            return 3
        }
    }
})

export default ({ app }) => {
    // Set i18n instance on app
    app.i18n = i18n
}

// if you need to import it from
// other files, then:
export { i18n }
