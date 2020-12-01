module.exports = [
{filename: "enter-class-number", phrase: "Please enter your class number, followed by the pound key."}
,{filename: "enter-class-number-7", phrase: "Please enter your 7 digit class number."}
,{filename: "bad-class-number", phrase: "Invalid class number, please try again."}

,{filename: "already-recording", phrase: "Already Recording."}

,{phrase: 'Please hold on the line for your class to start.', filename:'hold-wait-teacher'}
,{phrase: 'You are currently the only person in this conference. Please wait for others to join.',filename:'hold-wait-for-others'}

,{filename: "hand-raised", phrase:"Your hand is now raised."}
,{filename: "hand-lowered", phrase: "Your hand is now lowered."}
,{filename: "you-are-number", phrase: "You are num-ber"} //weird! it drops the B for some reason in "number"
,{filename: "listeners", phrase: "listeners"}
,{filename: "listener", phrase: "listener"}

,{filename: "question-asked", phrase: "Question!"}
//{filename: /"question-askedSoft", phrase: '<speak><amazon:effect phonation="soft">Question!</amazon:effect></speak>'} // NON-neural!

,{filename: "no-questions-removed", phrase: "No questions removed."}
,{filename: "questions-removed", phrase: "questions removed"}
,{filename: "1-question-removed", phrase: "one question removed"}

,{filename: "no-questions", phrase: "No questions."}
,{filename: "questions", phrase: "questions"}
,{filename: "1-question", phrase: "one question"}


,{filename: "all-students-muted", phrase: "All students are now muted."}
,{filename: "line-open", phrase: "Line is now open."}
,{filename: "line-closed", phrase: "Line is now closed."}

,{filename: "call-ends-five-minutes", phrase: "5 minutes until this call ends."}
,{filename: "call-ends-one-minute", phrase: "1 minute until this call ends."}
,{filename: "call-ends-now", phrase: "This conference is now over. Goodbye."}

,{filename: "choose-live-or-recordings", phrase: "Welcome. For the live class, press 0 and pound. To access the recordings, enter the recording number and then press pound. Or press star and # for the latest recording."}
,{filename: 'instructions-press-0', phrase:'Or press 0 # to hear the instructions'}
,{filename: 'instructions-about-live-student', phrase:'Press 1 to hear lyve conference instructions for a caller'}
,{filename: 'instructions-about-live-teacher', phrase:'Press 2 to hear lyve conference instructions for a teacher/moderator'}
,{filename: 'instructions-about-recording', phrase:'Press 3 to hear playback instructions for recordings'}
,{filename: 'instructions-finish', phrase:'Press 9 to return to the main menu'}
,{filename: 'instructions-for-live-student', phrase:'After calling in, dial your 7 digit class number. If previous recordings are available, you will have to enter 0 and # to join your class. For normal conferences, you have one option during the class: pressing 0. This will mute or unmute you. If you are concerned with noise around you, mute yourself after joining. For classes, you can also press 1 to "raise your hand". The teacher will hear "question". You can press 1 to lower your hand if you change your mind.'}
,{filename: 'instructions-for-live-teacher', phrase:'After calling in, dial your 7 digit teacher class number. If previous recordings are available, you will have to enter 0 and # to join your class. As a moderator, you have several features available: Press 1 to hear privately how many listeners there are. Press 2 to toggle locking if students are allowed to unmute themselves (it will lock and mute or unlock, but each student will have to unmute.). Press 3 to mute everyone (but they can still unmute themselves). If you are using the question functionality - students press 1 to raise their hand -- then you press 4 to call on the next student. If you need to move on, press 5 to clear all raised hands (but you will hear a count just in case.) Press 8 to start recording to be available later. Press 0 to mute or unmute yourself.'}
,{filename: 'instructions-for-recording', phrase:'After entering your 7 digit class number, if recordings are available you will be asked to enter the recording number and #. Or press star and # for the most recent recording. The recordings start at number 1 and go up at each recording, 2 then 3, etc.. During a playback, you have these controls: Press 0 to pause or unpause. Press 1 to rewind 30 seconds or 3 to fast-forward 30 seconds. Press 4 to rewind 5 minutes or press 6 to fast-forward 5 minutes. Press star to end the playback and return to the menu.'}
];