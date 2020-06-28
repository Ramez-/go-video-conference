import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Sdp } from './Sdp';
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.css']
})
export class CallComponent implements OnInit {

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  pcSender : any
  pcReciever :any
  meetingId: string
  peerId: string
  userId: string

  ngOnInit() {
    // use http://localhost:4200/call;meetingId=07927fc8-af0a-11ea-b338-064f26a5f90a;userId=alice;peerId=bob
    // and http://localhost:4200/call;meetingId=07927fc8-af0a-11ea-b338-064f26a5f90a;userId=bob;peerId=alice
    // start the call
    this.meetingId = this.route.snapshot.paramMap.get("meetingId");
    this.peerId = this.route.snapshot.paramMap.get("peerId");
    this.userId = this.route.snapshot.paramMap.get("userId")

    this.pcSender = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302'
        }
      ]
    })
    this.pcReciever = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302'
        }
      ]
    })

    this.pcSender.onicecandidate = event => {
      if (event.candidate === null) {
        this.http.post<Sdp>('/webrtc/sdp/m/' + this.meetingId + "/c/"+ this.userId + "/p/" + this.peerId + "/s/" + true,
        {"sdp" : btoa(JSON.stringify(this.pcSender.localDescription))}).subscribe(response => {
          this.pcSender.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(response.Sdp))))
        });
      }
    }
    this.pcReciever.onicecandidate = event => {
      if (event.candidate === null) {
          this.http.post<Sdp>('/webrtc/sdp/m/' + this.meetingId + "/c/"+ this.userId + "/p/" + this.peerId + "/s/" + false, 
          {"sdp" : btoa(JSON.stringify(this.pcReciever.localDescription))}).subscribe(response => {
          this.pcReciever.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(response.Sdp))))
        })
      }
    }
  }

  startCall() {
    // sender part of the call
    navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((stream) =>{
      var senderVideo :any = document.getElementById('senderVideo');
      senderVideo.srcObject = stream;
      var tracks = stream.getTracks();
      for (var i = 0; i < tracks.length; i++) {
        this.pcSender.addTrack(stream.getTracks()[i]);
      }
      this.pcSender.createOffer().then(d => this.pcSender.setLocalDescription(d))
    })
    // you can use event listner so that you inform he is connected!
    this.pcSender.addEventListener('connectionstatechange', event => {
      if (this.pcSender.connectionState === 'connected') {
          console.log("horray!")
      }
    });

  // receiver part of the call
  this.pcReciever.addTransceiver('video', {'direction': 'recvonly'})

  this.pcReciever.createOffer()
    .then(d => this.pcReciever.setLocalDescription(d))

  this.pcReciever.ontrack = function (event) {
    var receiverVideo :any = document.getElementById('receiverVideo')
    receiverVideo.srcObject = event.streams[0]
    receiverVideo.autoplay = true
    receiverVideo.controls = true
  }

  }

}
