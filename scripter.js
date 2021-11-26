const gpu = new GPU();
gpu.addFunction(prop)

let newcanva = document.createElement('CANVAS')
let genctx = newcanva.getContext('2d')




let tptcolors = ["0", "16769184", "2109648", "4210704", "16715776", "10526880", "14700560", "12632272", "2154512", "16764944", "14745376", "13664480", "8404992", "10535167", "4210784", "16777088", "12640511", "12623936", "2154751", "4223008", "830464", "15554047", "7932683", "10526975", "12632256", "1056960", "16777215", "4215024", "13434879", "5263472", "7360608", "16777215", "7368736", "15790267", "14737578", "8409168", "5263488", "8429791", "10396598", "3158064", "15724527", "13421772", "11184810", "5263424", "16765072", "4210752", "4214864", "6316128", "16777120", "12294655", "4210752", "12640511", "15419671", "8750341", "5263440", "16769184", "1063697", "2236962", "4456448", "2236962", "8429807", "8429823", "5521729", "15655104", "12300448", "10518672", "4478052", "8421504", "8421631", "16752704", "677638", "6532447", "8421504", "3355443", "3881738", "3869194", "7368816", "14737632", "830464", "7681424", "6710886", "14737632", "2109648", "5300191", "7938080", "699146", "8454048", "16777152", "7368768", "16724753", "16760368", "13421772", "11184810", "16764992", "16724223", "5439", "1052688", "657979", "6710886", "4473924", "12640511", "1056960", "2105376", "65399", "65467", "58453", "4210745", "11153616", "6693001", "15423767", "8427", "11180458", "7825015", "16777198", "498176", "52428", "16769184", "11184810", "11184810", "11184810", "7829367", "4473924", "2171169", "5673490", "4235360", "86", "16759552", "16777215", "6579455", "16773768", "2117856", "2368548", "11197917", "8960955", "6728447", "7368800", "14675967", "39372", "10079232", "12603472", "12628048", "668160", "16750848", "11140864", "9474192", "2391038", "00000000", "16773768", "5271807", "16119260", "2105376", "16777215", "7564141", "3874058", "670523", "14984356", "16763904", "1131707", "16769184", "48127", "10079232", "4473958", "16620824", "8978312", "16580821", "20480", "20480", "12320512", "11180441", "10066312", "14462252", "5263440", "14360608", "10027008", "16650742", "13895885", "16673022", "61046", "16755234", "14078420", "13329233", "15790240", "5267504", "7525076", "8700623", "3368601", "6750054", "12373471", "14016747", "8166400", "7500402", "11971263"]
//let avgclr = []

function getColor(v) {
	let b = (((v) >> (8 * 0)) & 0xff)
	let g = (((v) >> (8 * 1)) & 0xff)
	let r = (((v) >> (8 * 2)) & 0xff)

	return [r, g, b];
}

//new code stuff

let colors = tptcolors.map((val) => {
	return getColor(val);
});

function dist(x, y, z, x2, y2, z2) {
	return Math.hypot(x - x2, y - y2, z - z2);
}

function getClosest(r, g, b) {
	//returns the index of closest elem to rgb value
	let minDist = Infinity;
	let minI = 0;
	colors.forEach((item, i) => {
		let d = dist(...item, r, g, b);
		if (d < minDist) {
			minI = i;
			minDist = d;
		}
	});
	return minI;
}




const genimage = new Image()



//Get color pixels from the image
const getColors = gpu.createKernel(function(img, xoffset, yoffset) {
		const c = img[this.thread.y + yoffset][this.thread.x + xoffset];
		c[0] = c[0] * 255
		c[1] = c[1] * 255
		c[2] = c[2] * 255 //this.color(c[0], c[1], c[2], c[3]);
		c[3] = c[3] * 255
		return c
	})
	.setOutput({
		x: simSize.w - 8,
		y: simSize.h - 8
	})


function generateScript(deco, elems, useFill, useAlpha, fillBlack) {
	if (!ctxImage.src) return alert('You need to add an image!');
	let defaultElem = 67
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	//ctx.fillStyle = 'black'
	//ctx.fillRect((canvas.width / 2) - ((simSize.w / 2)), ((canvas.height / 2) - (simSize.h / 2)), simSize.w, simSize.h)
	ctx.drawImage(ctxImage, imageX, imageY, ctxImage.width, ctxImage.height);


	genimage.src = canvas.toDataURL()
	genimage.onload = () => {
		//let script = ['']
		let functionName = functionnameInput.value.toString().trim()
		if (functionName == '') functionName = 'image'
		let script = [`--print("Use ${functionName}() to draw your image!")`, `function ${functionName} ()`, `local a = 0`];

		let xf = Math.floor( ( (canvas.width / 2) ) - ( (simSize.w / 2) ) + 4 )
		let yf = Math.floor( ( (canvas.height / 2) ) - ( (simSize.h / 2) ) + 4 )
		let colors = getColors(genimage, xf, yf);
		let matches = {}; //Stores matched colors to their elements for speed


		for (y in colors) {
			for (x in colors[y]) {
				
				let c = colors[y][x]
				let cc = c
				if (!useFill && c[0] + c[1] + c[2] + c[3] == 0) continue;
				if (!fillBlack && c[3] == 255 && c[0] + c[1] + c[2] == 0) continue;
				
				let offsettedY = -y + (simSize.h - 4)
				if (elems) {
					let j = c.join('|')
					if (matches[j] == undefined) { //Checks if there is an already created key
						let u = getClosest(...c) //Sets u to the closest colored tpt element index
						matches[j] = u
					}
					c = matches[j] ?? c
					if (c == 4) c = 89 //Fire bad, dest good
				}
				else {
					c = defaultElem
				}
				//LCRY to BLGA
				if (c == 54) c = 47
				//Set GPMP life to 0
				if (c == 154) script.push(`a = sim.partCreate(-3, ${x}, ${offsettedY}, ${c})\nsim.partProperty(a, sim.FIELD_LIFE, 0)`)
				//Set CLST tmp to 5
				else if (c == 155) script.push(`a = sim.partCreate(-3, ${x}, ${offsettedY}, ${c})\nsim.partProperty(a, sim.FIELD_TMP, 5)`)
				//Change TRON to lime green-ish
				else if (c == 143) script.push(`a = sim.partCreate(-3, ${x}, ${offsettedY}, ${c})\nsim.partProperty(a, sim.FIELD_TMP, 12000)`)
				//Change SPRK to have a ctype of TUNG
				else if (c == 15) script.push(`a = sim.partCreate(-3, ${x}, ${offsettedY}, 171)\nsim.partProperty(a, sim.FIELD_CTYPE, 171)\nsim.partProperty(a, sim.FIELD_LIFE, 10)\nsim.partProperty(a, sim.FIELD_TYPE, 15)`)
				else script.push(`sim.partCreate(-3, ${x}, ${offsettedY}, ${c})`)
				
				if (deco/* && (c != 54)*/) {
					if (useAlpha) {
						script.push(`sim.decoBox(${x}, ${offsettedY}, ${x}, ${offsettedY}, ${cc[0]}, ${cc[1]}, ${cc[2]}, ${cc[3]})`)
					} else {
						script.push(`sim.decoBox(${x}, ${offsettedY}, ${x}, ${offsettedY}, ${cc[0]}, ${cc[1]}, ${cc[2]})`)
					}
				}
			}
			script.push(`-- y = ${y}`)
		}
		script.push('end')
		let title = filenameInput.value.toString().trim()
		if (title == '.lua') title = ((imageInput.files[0] ?? {}).name ?? 'img')
		if (!title.endsWith('.lua')) title = title + '.lua'
		download(title, script.join('\n'))
		render()
	};
}