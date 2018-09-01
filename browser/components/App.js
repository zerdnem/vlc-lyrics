const {remote} = require('electron')
const {app} = require('electron').remote
const {h, Component} = require('preact')

const TitleBar = require('./TitleBar')
const TrackInfo = require('./TrackInfo')
const LyricsBox = require('./LyricsBox')

const lyrics = require('../../modules/lyrics')

const vlc = require('./Status')

let id = 0

class App extends Component {
    constructor() {
        super()

        this.state = {
            autoscroll: true,
            alwaysOnTop: false
        }

        // get song data every 1sec
        setInterval(() => {
            vlc.get().then(res => {
                let songId = ++id
                this.setState({
                    id: songId,
                    loading: true,
                    title: res.title,
                    artists: [res.artist],
                    album: res.album,
                    art: null,
                    lyrics: null,
                    url: null,
                    position: res.position,
                    total: res.total
                })

                let query = [this.state.title, ...this.state.artists].join(' ')
                lyrics.get(query, (err, result) => {
                    if (err) return this.setState({ loading: false })
                    result.loading = false
                    if (this.state.id) this.setState(result)
                })
            }).catch(err => console.log(err))

        }, 1000)

        // this will run on startup
        vlc.get().then(res => {
            let songId = ++id
            this.setState({
                id: songId,
                loading: true,
                title: res.title,
                artists: [res.artist],
                album: res.album,
                art: null,
                lyrics: null,
                url: null,
                position: res.position,
                total: res.total
            })

            let query = [this.state.title, ...this.state.artists].join(' ')

            lyrics.get(query, (err, result) => {
                if (err) return this.setState({ loading: false })
                result.loading = false
                if (this.state.id) this.setState(result)
            })
        }).catch(err => console.log(err))

    }

    componentDidMount() {
        this.setState({
            autoscroll: localStorage.autoscroll == 'true',
            alwaysOnTop: localStorage.alwaysOnTop == 'true'
        })
    }

    componentDidUpdate({}, {alwaysOnTop, autoscroll}) {
        if (this.state.alwaysOnTop != alwaysOnTop) {
            let win = remote.getCurrentWindow()
            win.setAlwaysOnTop(this.state.alwaysOnTop)
            localStorage.alwaysOnTop = this.state.alwaysOnTop
        }

        if (this.state.autoscroll != autoscroll) {
            localStorage.autoscroll = this.state.autoscroll
        }
    }

    render({}, state) {
        let {loading, title, artists, album, art,
            lyrics, url, position, total,
            autoscroll, alwaysOnTop} = state

        return h('div', {id: 'root'},
            h(TitleBar),

            h(TrackInfo, {
                loading,
                title, artists, album, art,
                menu: [
                    {
                        label: 'Autoscroll',
                        type: 'checkbox',
                        checked: autoscroll,
                        click: () => this.setState({autoscroll: !autoscroll})
                    },
                    {
                        label: 'Always On Top',
                        type: 'checkbox',
                        checked: alwaysOnTop,
                        click: () => this.setState({alwaysOnTop: !alwaysOnTop})
                    },
                    {type: 'separator'},
                    {
                        label: 'Exit',
                        click: () => app.quit()
                    }
                ]
            }),

            h('main', {},
                h(LyricsBox, {loading, lyrics, url, position, total, autoscroll}),
                h('div', {class: 'fade-in'}),
                h('div', {class: 'fade-out'})
            )
        )
    }
}

module.exports = App
