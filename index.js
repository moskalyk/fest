const {arenaChannelFlattened,
    arenaBlocks,
    arenaUploadBlock,
    arenaAddToChannel,
    arenaChannelMetadata,
    arenaChannelUpdateMetadata} = require('./lib')
const bearer_token = process.argv[2]
const gates = {
    'add': (arg1, arg2) => {
      return parseInt(arg1) + parseInt(arg2)
    },
    'mul': (arg1, arg2) => {
      return parseInt(arg1) * parseInt(arg2)
    },
    'gth': (arg1, arg2) => {
        return parseInt(arg1) >= parseInt(arg2)
    },
    'arena_post_block': (arg1, arg2) => {
        console.log('posting')  
        console.log(bearer_token)
        console.log(arg1)
        let pv1 = 'nero_m'
        let pv2 = 'rick'
        
        let hp_pv1
        let hp_pv2
        
        let pv_b1 = {}
        let pv_b2 = {}
        
        arenaBlocks(arg1, bearer_token, 1).then(ab => {
            for(let i = 0; i < ab.data.length; i++){
                if(ab.data[i].title.includes('round')){
                    console.log(ab.data[i])
                    hp_pv1 = ab.data[i].metadata.hp_pv1
                    hp_pv2 = ab.data[i].metadata.hp_pv2
                }
            }
            
            // console.log(hp_pv1)
            // console.log(hp_pv2)
            
            const placements_pv1 = []
            const placements_pv2 = []
            
            arenaBlocks(arg1, bearer_token, 1).then(ab => {
                for(let i = 0; i < ab.data.length; i++){
                    if(ab.data[i].title.includes('round')){
                        break
                    } else {
                        const placement = JSON.parse(ab.data[i].metadata.placement)
                        const placement_att = JSON.parse(ab.data[i].metadata.attack_place)
                        if(ab.data[i].user.username == pv1){
                            placements_pv1.push({p: placement, def: placement_att})
                        }
                        
                        if(ab.data[i].user.username == pv2){
                            placements_pv2.push({p: placement, def: placement_att})
                        }
                    
                    }
                }
                
                for(let i = 0; i < ab.data.length && !ab.data[i].title.includes('round'); i++){
                
                        // need to duplicate for player 2
                        const filteredArray1 = placements_pv1.map( p => p.p.filter(value => {
                            return JSON.parse(ab.data[i].metadata.attack_place).includes(value)
                        }));
                        
                        console.log(filteredArray1)
                        
                        if(filteredArray1){
                            if(ab.data[i].user.username == pv1){
                                hp_pv2 -= ab.data[i].metadata.attack
                            } else {
                                hp_pv1 -= ab.data[i].metadata.attack
                            }
                        }
                }
    
                
                const block = {
                    value: 'hp '+hp_pv1+'\nhp ' + hp_pv2,
                    title: 'round '+arg2,
                    metadata: {hp_pv1: hp_pv1, hp_pv2: hp_pv2}
                }
                console.log(block)
                arenaUploadBlock([arg1], block, bearer_token) 
                
             })
        })
        

        // get previous blocks, update hp
        //  const block = {
        //     // value: 'https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiI1MTAxNjM3Ni9vcmlnaW5hbF9lYjJiYWYyMjkyOTJkNzMyYmMwMGQ5NGVmZTY1MDdlNy53ZWJwIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjoxMjAwLCJoZWlnaHQiOjEyMDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbWVudCI6dHJ1ZX0sIndlYnAiOnsicXVhbGl0eSI6NzV9LCJqcGVnIjp7InF1YWxpdHkiOjc1fSwicm90YXRlIjpudWxsfX0=',
        //     title: 'historic shanks',
        //     description: JSON.stringify({attack: 25, attack_place: JSON.stringify(['a', 'd']), placement: JSON.stringify(['a','w','d'])}),
        //     metadata: {attack: 20, attack_place: JSON.stringify(['a', 'd']), placement: JSON.stringify(['a','w','d'])}
        // }
        
        // // get previous blocks, update hp
        //  const block = {
        //     value: JSON.stringify({hp_pv1: 100, hp_pv2: 100}),
        //     title: 'round '+arg2,
        //     metadata: {hp_pv1: 100, hp_pv2: 100}
        // }
        
        // arenaUploadBlock(['fest-inventory'], block, bearer_token) 
        
        return Number(arg2) + 1
    },
    '@': (arg) => {
      return arg
    }
}

const stairs = `
    return (func) => {
        return (args) => {
            return gates[func](...args)
        }
    }
`
const runes = [':-', '^-', '|=', '=/', '|-', '?:', '%=', '$']

const caseByCase = (rune) => `case '${rune}': ${stairs} break;`
const runeRunner = eval(`const appendage = (rune) => {switch(rune){${runes.reduce((initial, rune) => {
    return initial + caseByCase(rune)
}, '')}}}; const returnFunc = () => appendage; returnFunc()`)

const wait = (ms) => new Promise((res) => setTimeout(res, ms))
const compiler = (hoon, depth, verbose, args) => {
    try {
        const isRune = hoon.slice(0,2)
        const pattern = /(?<rune>\S+)\s{2}(?<func>\w+)\s{2}(?<arg1>.*)\s{2}(?<arg2>.*)/;
        if(runes.includes(isRune) && isRune == runes[2]){
            const pattern2Cells = /(.*)\[((.+)(?=\=)=(.+))+\s(.*)=(.*)\](.*)/; // (?<rune>\S+)\s{2}\[((?<var>.*?)(?=\=)(.*)]*)\]
            const pattern1Atom = /((=\/.+)\s{2})(?=\?:)(.+)/; // (?<rune>\S+)\s{2}\[((?<var>.*?)(?=\=)(.*)]*)\]

            const match = hoon.match(pattern2Cells)
            let match1 = hoon.match(pattern1Atom)
             const functionName = (a, b) => {
                const bounding = /(?<rune>\S+)\s{2}(?<func>\w+)\s{2}(?<arg1>.*)\s{2}(?<arg2>.*)\s{2}(?<arg3>.*)/
                const match1 = hoon.match(bounding)
                let result;
                
                result = runeRunner(match1.groups.rune)(match1.groups.func)([a, b])
                if(result) return a
                else return b
            }
            
            const functionName1Atom = async (a) => {
                                         // (.+)\s{2}(.+)\s{2}(.+)\s{2}(?=\?|=\/:)(.+)
                const localBounding = /(.*)\s{2}((.+)(?=\=)=(.+)\s{2}(?=\=))+(.*)/
                let matchAtoms
                let checkForLocal = true
                let vars = []
                let i = 0;
                matchAtoms = hoon.match(localBounding)
                
                const inputs = matchAtoms[3].trim().split('=')
                const isCenTis = matchAtoms
                let vars2 = {}
                
                const firstMatch = matchAtoms[0].match(/(.+)\s{2}\|-\s{2}(.+)\s{2}((?=%=)(.+)\s{2}(?=\=))+(.*)==/)
                    

                if(vars2 != {}){

                    const firstMatch = matchAtoms[0].match(/(.+)\s{2}\|-\s{2}(.+)\s{2}((?=%=)(.+)\s{2}(?=\=))+(.*)==/)

                    const secondMatch = firstMatch[1].match(/(.*)\s{2}((.+)(?=\=)=(.+)\s{2}(?=\=))+(.*)/)
                    const inputsSecondMatch = secondMatch[3].trim().split('=')
                    const inputsSecondMatch1 = secondMatch[4].trim().split('  ')
                    const inputsSecondMatch2 = secondMatch[5].trim().split('  ')
                    
                    // small hack
                    // process.exit();
                    vars2[inputsSecondMatch1[1]] = inputsSecondMatch1[2]
                    vars2[inputsSecondMatch2[1]] = inputsSecondMatch2[2]
                    const secondIshMatch = ((firstMatch[2] + "  " + firstMatch[3]) + "==").match(/(.*)\s{2}((.+)(?=\=)=(.+)\s{2}(?=\=))+(.*)/)

                    let fourthMatch = firstMatch[3].match(/\$\s{2}(?<assign>(((\S+)\s{2}(\S+)))\s{2})*/)
                    let checker = false
                    let updatedMatch
                    updatedMatch = fourthMatch[0]

                    vars2[inputsSecondMatch[0]] = a
                        
                    const thirdMatch = secondIshMatch[1].match(/(?<rune>\S+)\s{2}(?<func>\w+)\s{2}(?<arg1>.*)\s{2}(?<arg2>.*)\s{2}(?<arg3>.*)(?<arg4>.*)/)
                    
                    while(!runeRunner(thirdMatch.groups.rune)(thirdMatch.groups.func)([vars2[thirdMatch.groups.arg1], vars2[thirdMatch.groups.arg2]])){
                        const secondIshMatch = ((firstMatch[2] + "  " + firstMatch[3]) + "==").match(/(.*)\s{2}((.+)(?=\=)=(.+)\s{2}(?=\=))+(.*)/)
                        
                        const inbetween = secondIshMatch[0].match(/(?<rune>\S+)\s{2}(?<func>\w+)(\s{2}(?<arg>\S+))?\s{2}%=\s{2}(?<arg3>.*)/)
                                            
                        while(true){
                        updatedMatch = fourthMatch[0]
                            const secondIshMatch = ((firstMatch[2] + "  " + firstMatch[3]) + "==").match(/(.*)\s{2}((.+)(?=\=)=(.+)\s{2}(?=\=))+(.*)/)
                            updatedMatch = secondIshMatch[2].match(/\$\s{2}(?<func>\w+)\s{2}(?<rune>\S+)(\s{2}(?<arg2>\S+)\s{2}(\S+)*)\s{2}(\S+)\s{2}/)

                           
                            let compute1;
                            compute1 = vars2[updatedMatch[5]]
                            
                            if(updatedMatch[5] in vars2) {
                                compute1 = vars[updatedMatch[5]]
                            } else {
                                compute1 = updatedMatch[5]
                            }
                            let compute2;
                        
                             if(updatedMatch[6] in vars2) {
                                compute2 = vars2[updatedMatch[6]]
                            } else {
                               compute2 = updatedMatch[6]
                            }
                            
                             await wait(Number(vars2['wait']))
                            console.log(vars2)
                            vars2[updatedMatch[1]] = runeRunner(updatedMatch.groups.rune)(updatedMatch.groups.arg2)([compute1, compute2])
                                                        
                           
                            if(vars2['print']) {
                                console.log(vars2[vars2['print']])
                            }

                            if(updatedMatch[0].trim() == runes[7]) break;

                            vars2[updatedMatch[7]] = updatedMatch[8]
                            secondIshMatch[2] = secondIshMatch[2].replace('%=  $  '+ updatedMatch[1] +'  '+ updatedMatch[2] + updatedMatch[3] + '  ' + updatedMatch[6], '')
                            vars2[secondIshMatch[2].trim().split(' ')[0]] = secondIshMatch[2].trim().split(' ')[2]
                            if(runeRunner(thirdMatch.groups.rune)(thirdMatch.groups.func)([vars2[thirdMatch.groups.arg1], vars2[thirdMatch.groups.arg2]])) break;
                        }
                        
                        break;
                    }
                    
                    return vars2[thirdMatch.groups.arg3]

                } else {
                    
                    const localBounding2 = /((\S+)\s{2}(\S+)\s{2}(\S+))\s*(.*)/

                    let matchAtomsNonInputs = matchAtoms[0].replace(matchAtoms[1], '').replace(matchAtoms[3].trim(), '').trim().match(localBounding2)
                    
                    const vars1 = {}
                                                vars1[matchAtomsNonInputs[3]] = matchAtomsNonInputs[4] 

                let lastCheck = false
                while(!lastCheck){
                    const localBounding2 = /((\S+)\s{2}(\S+)\s{2}(\S+))\s*(.*)/

                    let atomsNonInputs = matchAtomsNonInputs[0].replace(matchAtomsNonInputs[1], '')
                    matchAtomsNonInputs = atomsNonInputs.match(localBounding2)
                    // lastCheck = true
                    if(matchAtomsNonInputs[5].slice(0,2) != runes[3]){
                                                                    vars1[matchAtomsNonInputs[3]] = matchAtomsNonInputs[4] 

                        checkForLocal = true
                        break;

                    } else {
                        vars1[matchAtomsNonInputs[3]] = matchAtomsNonInputs[4] 
                    }
                }
                
                let result;
                console.log(vars)
                const bounding = /(?<rune>\S+)\s{2}(?<func>\w+)\s{2}(?<arg1>.*)\s{2}(?<arg2>.*)\s{2}(?<arg3>.*)\s{2}(?<arg4>.*)/
                const matches = matchAtomsNonInputs[5].match(bounding)
                const funcRegex = /(.+)\s{2}(.+)/

                vars1[inputs[0]] = a
                result = runeRunner(matches.groups.rune)(matches.groups.func)([vars1[matches.groups.arg1], vars1[matches.groups.arg2]])
                if(result) return vars1[matches.groups.arg3]
                else return vars1[matches.groups.arg4]
                                }

            }
            
            if(match1 != null){
                return functionName1Atom
            } else {
                return functionName

            }

        } else if(runes.includes(isRune)){
            
            const match = hoon.match(pattern)
            const isRuneArg1 = match.groups.arg1.slice(0,2)
            const isRuneArg2 = match.groups.arg2.slice(0,2)
            
            if(runes.includes(isRuneArg1)){
                verbose && console.log('depth: ', depth+1)
                return runeRunner(match.groups.rune)(match.groups.func)([compiler(match.groups.arg1, depth+1), match.groups.arg2])
            } 
            
            if(!runes.includes(isRuneArg2)){
                const pattern = /(?<rune>\S+)\s{2}(?<func>\w+)\s{2}(?<arg1>\S+)\s{2}(?<arg2>.*)/;
                const match2 = hoon.match(pattern)
                verbose && console.log('depth: ', depth+1)
                return runeRunner(match.groups.rune)(match.groups.func)([match2.groups.arg1, compiler(match2.groups.arg2, depth+1)])
            } 
        } 
        const match2 = hoon.match(pattern)

        return runeRunner(match2.groups.rune)(match2.groups.func)([match2.groups.arg1, match2.groups.arg2])
    }catch(err) {
        const pattern = /(?<rune>\S+)\s{2}(?<func>\w+)\s{2}(?<arg1>.*)\s{2}(?<arg2>.*)/;
        const match = hoon.match(pattern)
        verbose && console.log('depth: ', depth+1)
        return runeRunner(match.groups.rune)(match.groups.func)([match.groups.arg1, match.groups.arg2])
    }
}

let text = "^-  @  1";
let hoon1 = ":-  add  1  2";
let hoon2 = ":-  add  1  :-  add  1  2";
let hoon3 = ":-  add  1  :-  add  :-  add  1  :-  add  1  2";// <|>
let hoon5 = ":-  add  :-  add  1  2  2";
let hoon6 = ":-  gth  3  2"
let hoon7 = "|=  [a=@ud b=@ud]  ?:  :-  gth  a  b  a  b"

let hoon8 = "|=  a=@ud  =/  counter  1  =/  sum  0  |-  ?:  :-  gth  counter  a  sum  %=  $  counter  :-  add  counter  1  sum  :-  add  counter  sum  =="
let hoon9 = "|=  a=@ud  =/  b  4  ?:  :-  gth  a  b  a  b"
let hoon10 = "|=  a=@ud  =/  b  4  =/  sum  0  ?:  :-  gth  a  b  sum  b"
let hoon11 = "|=  a=@ud  =/  b  4  =/  counter  0  |-  ?:  :-  gth  counter  a  counter  %=  $  counter  1  b  2  =="
let hoon12 = "|=  a=@ud  =/  b  4  =/  counter  0  |-  ?:  :-  gth  counter  a  counter  %=  $  counter  :-  add  1  counter  b  2  =="

const verbose = false

let hoon13 = "|=  a=@ud  =/  counter  3  =/  b  2  |-  ?:  :-  gth  counter  a  counter  %=  $  counter  :-  arena_post_block  fest-_x97es5kzm8  counter  wait  100000  =="
;
(async () => {
    console.log(await compiler(hoon13, 0, verbose)(6))/ true
})()
