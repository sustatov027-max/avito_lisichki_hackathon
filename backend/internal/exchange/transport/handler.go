package transport

import "net/http"

type ExchangeHandler struct{
	ExchangeService
}

type ExchangeService interface{
	PostExchange()
}

func (h *ExchangeHandler) PostExchangeHandler(w http.ResponseWriter, r *http.Request){
	

}