async function arenaBlocks(slug, bearerToken, page){
    try{
        // TODO: get pages
        const res = await fetch(`https://api.are.na/v3/channels/${slug}/contents?page=${page}&per=${100}`,{
           type: 'GET',
           contentType: 'application/json',
           headers: {
              'Authorization': `Bearer ${bearerToken}`
           }
        });
        
        const json = await res.json()
        
        return json
    }catch(err){
        console.log(err)
        return
    }
}

async function arenaChannelFlattened(slug, bearerToken, maxLayers = 3, layers = 1) {

    if(layers == maxLayers) return []
    
    const blocks = []
    const res = await arenaBlocks(slug, bearerToken, 1)
    
    for(let i = 0; i < res.data; i++){
        if(res.data[i].type == 'Channel'){
            const res = await arenaBlocks(res.data[i].slug, bearerToken, 1)
            blocks.push(...res.data)
        }
        
    }
    
    const queryLength = res.meta.total_pages   
    
    for(let i = 1; i<= queryLength; i++){
    
        const res1 = await arenaBlocks(slug, bearerToken, i)
        
        for(let j = 0; j < res1.data.length; j ++){
        
            if(res1.data[j].type == 'Channel'){
                const blocksFromLayer = await arenaChannelFlattened(res1.data[j].slug, bearerToken, maxLayers, layers+1)
                // const res2 = await arenaBlocks(res1.data[j].slug, bearerToken, 1)
                // blocks.push(...res2.data.filter(d => d.type != 'Channel'))
                // console.log(blocksFromLayer)
                blocks.push(...blocksFromLayer)
                // for(let k = 2; k <= res2.meta.total_pages; k++){
                //     const res3 = await arenaBlocks(res1.data[j].slug, bearerToken, k)
                //     blocks.push(...res3.data.filter(d => d.type != 'Channel'))
                // }
                
            } else {
                blocks.push(res1.data[j])
            }
        }
    }
    
    return blocks
}

async function arenaUploadBlock(slugs, block, bearerToken) {
    try{
        if(!block.description) block.description = ''
        const res = await fetch(`https://api.are.na/v3/blocks`,{
           method: 'post',
           headers: {
           'Content-Type': 'application/json',
              'Authorization': `Bearer ${bearerToken}`
           },
           body: JSON.stringify({
               channel_ids: slugs,
               value: block.value,
               title: block.title,
               metadata: block.metadata,
               description: block.description
           })
        });

        const json = await res.json()
        console.log(json)
        return JSON.stringify(json)
    }catch(err){
        console.log(err)
        return
    }
}

async function arenaAddToChannel(slug, blockId, bearerToken) {
    try{
        const res = await fetch(`https://api.are.na/v3/connections`,{
           method: 'post',
           headers: {
           'Content-Type': 'application/json',
              'Authorization': `Bearer ${bearerToken}`
           },
           body: JSON.stringify({
               connectable_id: blockId,
               connectable_type: 'Block'
           })
        });

        const json = await res.json()
        return JSON.stringify(json)
    }catch(err){
        console.log(err)
        return
    }
}

async function arenaChannelMetadata(slug, channelId, bearerToken) {
    try{
        const res = await fetch(`https://api.are.na/v3/channels/${channelId}`,{
           method: 'get',
           headers: {
           'Content-Type': 'application/json',
              'Authorization': `Bearer ${bearerToken}`
           },
        });

        const json = await res.json()
        return JSON.stringify(json.metadata)
    }catch(err){
        console.log(err)
        return
    }
}

async function arenaChannelUpdateMetadata(slug, channelId, metadata, bearerToken) {
    try{
        const res = await fetch(`https://api.are.na/v3/channels/${channelId}`,{
           method: 'post',
           headers: {
           'Content-Type': 'application/json',
              'Authorization': `Bearer ${bearerToken}`
           },
           body: JSON.stringify({
               metadata: metadata
           })
        });

        const json = await res.json()
        return JSON.stringify(json)
    }catch(err){
        console.log(err)
        return
    }
}

async function arenaProfileThings(id, bearerToken, type) {
    try{
        const res = await fetch(`https://api.are.na/v3/users/${id}/contents`,{
           method: 'post',
           headers: {
           'Content-Type': 'application/json',
              'Authorization': `Bearer ${bearerToken}`
           },
           body: JSON.stringify({
               type: type
           })
        });

        const json = await res.json()
        return JSON.stringify(json)
    }catch(err){
        console.log(err)
        return
    }
}

module.exports = {
    arenaChannelFlattened,
    arenaBlocks,
    arenaUploadBlock,
    arenaAddToChannel,
    arenaChannelMetadata,
    arenaChannelUpdateMetadata
}
