Goal: 
Generate freeswitch sound files using Amazon Polly.

Motivation:
 - If you have a whole sound set, you can generate new sounds when you want that sound consistent with the others
 - Why now?
 - - Polly licence allows you to re-use the files
     >Q. Can I use the service for generating static voice prompts that will be replayed multiple times?
     >Yes, you can. The service does not restrict this and there are no additional costs for doing so. https://aws.amazon.com/polly/faqs/
 - - Voices, especially Neural, are pretty high quality
 - - Multiple languages with the same API
 - - Pretty cheap
 
Limitations:
 - Highest quality sounds they produce is only 24000, whereas FreeSWITCH sounds come with 48000.
 
Contributing:
- How to get the best audio quality?
 - - 24000 only comes from OGG/MP3, but we want WAV/PCM for raw audio -- we should convert -- from mp3 or ogg?
 - - Is downsampling 16000 PCM to 8000 with sox just as good as re-generating at 8000?
 - - If you're an audiophile or know how FreeSWITCH handles audio, check the various files in the conference folder.
- Test mod_say for numbers and currencies.
- - Do the files flow together?
- - If so, how do we fix it? And automate it? Maybe the non-neural ones are better for numbers?
 
How to generate more audio:
- You'll need to save your amazon credentials in `creds.ini`
- Run `npm install`
- Make a list, or a single file, and pass it to the function.
- Modify any other options of the voice, format, sample rate.
- run node generate.js
 
TODO:
- Automate all the downsampling using sox
- Take an XML phrases file as input
- Only generate the files that are missing
- Better "API" to use
- Ensure path exists where we're trying to save
