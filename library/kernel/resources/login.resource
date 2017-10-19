<!-- Login Screen -->
<div id="login" style="opacity:0">
	<div class="all fixed">
		<img class="wallpaper" src="./resources/images/login-background.jpg" />
	</div>
	<div class="all fixed loginScreen">
		<div class="loginBox">
			<span class="label"><%=login_user%></span>
			<div class="loginInputContainer">
				<span id="login_icon" class="icon icon-user"></span>
				<input type="text" id="login_input" />
			</div>
			<a id="login_go" class="go" href="javascript:void(0)">&gt;</a>
			<div class="clear"></div>
			<a class="recovery" href="javascript:void(0)"><%=login_recovery%></a>
		</div>
		<!--
		<div class="loginBar">
			<div style="padding-left: 20px">
				<span class="label">Usuário</span>
				<input type="text" id="loginControl" />
				<input type="hidden" id="uid" value="0" />
				<button id="login-go"><span class="icon-arrow-right8"></span></button>
			</div>
		</div>
		<div style="position: absolute; width: calc(100% - 10px); height: 20px; line-height: 20px; text-align: right; padding-right: 10px; bottom: 0px; font-size: 0.8em;">wack</div>
		-->
	</div>
</div>