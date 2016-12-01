// 有关“空白”模板的简介，请参阅以下文档:
// http://go.microsoft.com/fwlink/?LinkId=232509

(function () {
	"use strict";

	var app = WinJS.Application;
	var activation = Windows.ApplicationModel.Activation;
	var isFirstActivation = true;

	app.onactivated = function (args) {
		if (args.detail.kind === activation.ActivationKind.voiceCommand) {
			//TODO: 处理相关的 ActivationKinds。例如，如果你的应用可通过语音命令启动，
			//这是确定是否填充输入字段或选择其他初始视图的好时机。
		}
		else if (args.detail.kind === activation.ActivationKind.launch) {
			//当用户通过磁贴启动应用时，会发生“启动”激活。
			//或通过单击或点击正文调用 toast 通知。
			if (args.detail.arguments) {
				//TODO: 如果应用支持 toast，请使用 toast 有效负载中的此值确定应用中的位置
				//为了使用户作出响应，请调用 toast 通知。
			}
			else if (args.detail.previousExecutionState === activation.ApplicationExecutionState.terminated) {
				//TODO: 此应用程序先被挂起，然后被终止，以回收内存。
				// 若要创造顺畅的用户体验，请在此处还原应用程序状态，使应用似乎永不停止运行。
				//注意: 可能需要记录应用最近挂起的时间，并仅在应用恢复一段时间后才还原其状态。
			}
		}

		if (!args.detail.prelaunchActivated) {
			//TODO: 如果 prelaunchActivated 为 true，则意味着应用作为一种优化在后台预启动。
			//在这种情况下，它会在那之后不久挂起。
			//启动时发生任何长时间运行的操作(例如昂贵的网络或磁盘 I/O)或对用户状态进行更改
			//应在此处完成(以避免在预启动情况下执行这些操作)。
			//或者，可在恢复或 visibilitychanged 处理程序中完成此工作。
		}

		if (isFirstActivation) {
			//TODO: 应用已激活但未运行。请在此处执行常规启动初始化。
			document.addEventListener("visibilitychange", onVisibilityChanged);
			args.setPromise(WinJS.UI.processAll());
		}

		isFirstActivation = false;
	};

	function onVisibilityChanged(args) {
		if (!document.hidden) {
			//TODO: 应用变得可见。这可能是刷新视图的好时机。
		}
	}

	app.oncheckpoint = function (args) {
		// TODO: 此应用程序将被挂起。请在此保存需要挂起中需要保存的任何状态。
		//你可以使用 WinJS.Application.sessionState 对象，该对象在挂起中会自动保存和还原。
		//如果需要在应用程序被挂起之前完成异步操作，请调用 args.setPromise()。
	};

	app.start();

})();
